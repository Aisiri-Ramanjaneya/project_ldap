require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────
app.use(cors({
  origin:      "http://localhost:3000", // React dev server
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Health check ────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running. CD pipeline is working successfully!" });
});

// ── 404 fallback ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Global error handler ────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   LDAP URL: ${process.env.LDAP_URL}`);
  console.log(`   LDAP Base DN: ${process.env.LDAP_BASE_DN}\n`);
});
