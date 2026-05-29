const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");

// ─────────────────────────────────────────────
// Mock users for Regular Login
// In production, replace with a real database
// ─────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, username: "admin",   password: "admin123",  name: "Admin User",  role: "admin"  },
  { id: 2, username: "john",    password: "john123",   name: "John Doe",    role: "user"   },
  { id: 3, username: "jane",    password: "jane123",   name: "Jane Smith",  role: "user"   },
];

// ─────────────────────────────────────────────
// Helper: sign JWT
// ─────────────────────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

// ─────────────────────────────────────────────
// POST /api/auth/login  — Regular login
// Body: { username, password }
// ─────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = signToken({
    id:       user.id,
    username: user.username,
    name:     user.name,
    role:     user.role,
    authType: "regular",
  });

  return res.json({
    message: "Login successful.",
    token,
    user: {
      id:       user.id,
      username: user.username,
      name:     user.name,
      role:     user.role,
      authType: "regular",
    },
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/ldap-login  — LDAP login
// Body: { username, password }
// Connects to Apache Directory Server
// ─────────────────────────────────────────────
router.post("/ldap-login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Build the user DN — Apache DS default format
  const userDN = `uid=${username},${process.env.LDAP_USER_OU}`;

  // Create LDAP client
  const client = ldap.createClient({
    url:            process.env.LDAP_URL,
    connectTimeout: 5000,
    timeout:        5000,
  });

  // Handle connection errors (e.g. Apache DS not running)
  client.on("error", (err) => {
    console.error("LDAP connection error:", err.message);
    return res.status(503).json({
      message: "Cannot connect to LDAP server. Make sure Apache Directory Server is running on port 10389.",
      detail:  err.message,
    });
  });

  // Attempt to bind (authenticate) with user credentials
  client.bind(userDN, password, (err) => {
    if (err) {
      client.destroy();
      console.error("LDAP bind failed:", err.message);

      // Distinguish between wrong credentials and other errors
      if (err.name === "InvalidCredentialsError") {
        return res.status(401).json({ message: "Invalid LDAP username or password." });
      }
      return res.status(500).json({
        message: "LDAP authentication failed.",
        detail:  err.message,
      });
    }

    // Bind succeeded — now search for user details
    const searchOptions = {
      scope:  "sub",
      filter: `(uid=${username})`,
      attributes: ["uid", "cn", "sn", "givenName", "mail", "displayName"],
    };

    client.search(process.env.LDAP_USER_OU, searchOptions, (searchErr, searchRes) => {
      let userEntry = null;

      searchRes.on("searchEntry", (entry) => {
        userEntry = entry.pojo?.attributes || [];
      });

      searchRes.on("error", () => {
        // Search failed but bind succeeded — issue token with basic info
        client.unbind();
        const token = signToken({
          username,
          name:     username,
          authType: "ldap",
        });
        return res.json({
          message: "LDAP login successful.",
          token,
          user: { username, name: username, authType: "ldap" },
        });
      });

      searchRes.on("end", () => {
        client.unbind();

        // Parse display name from LDAP attributes
        let displayName = username;
        if (userEntry && Array.isArray(userEntry)) {
          const cn = userEntry.find((a) => a.type === "cn");
          if (cn && cn.values?.[0]) displayName = cn.values[0];
        }

        const token = signToken({
          username,
          name:     displayName,
          authType: "ldap",
        });

        return res.json({
          message: "LDAP login successful.",
          token,
          user: {
            username,
            name:     displayName,
            authType: "ldap",
          },
        });
      });
    });
  });
});

// ─────────────────────────────────────────────
// GET /api/auth/me  — Get current user (protected)
// ─────────────────────────────────────────────
const { verifyToken } = require("../middleware/auth");

router.get("/me", verifyToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
