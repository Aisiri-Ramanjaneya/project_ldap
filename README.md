# AuthPortal — Regular + LDAP Authentication

A full-stack authentication app with **React** frontend and **Node.js/Express** backend,
supporting both local (regular) login and LDAP login via **Apache Directory Server**.

---

## Project Structure

```
project/
├── backend/
│   ├── server.js           ← Express app entry point
│   ├── .env                ← LDAP config & secrets
│   ├── routes/auth.js      ← /api/auth/login & /api/auth/ldap-login
│   ├── middleware/auth.js  ← JWT verification
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.jsx
    │   ├── context/AuthContext.jsx   ← Global auth state
    │   ├── api/axios.js              ← API helper
    │   ├── components/ProtectedRoute.jsx
    │   └── pages/
    │       ├── LoginSelector.jsx/css ← Choose auth method
    │       ├── RegularLogin.jsx      ← Local login form
    │       ├── LDAPLogin.jsx         ← LDAP login form
    │       ├── AuthForm.css          ← Shared form styles
    │       ├── Dashboard.jsx/css     ← Post-login home page
    └── package.json
```

---

## Step 1 — Set up Apache Directory Server

1. **Download** Apache Directory Server from https://directory.apache.org/apacheds/downloads.html
2. **Install and start** it (default port: `10389`)
3. **Open Apache Directory Studio** (the GUI client)
4. Connect to: `ldap://localhost:10389`
   - Bind DN: `uid=admin,ou=system`
   - Password: `secret`

5. **Create a partition** (if not already):
   - Suffix: `dc=example,dc=com`

6. **Create an OU for users**:
   ```
   dn: ou=users,dc=example,dc=com
   objectClass: organizationalUnit
   ou: users
   ```

7. **Create a test user**:
   ```
   dn: uid=jdoe,ou=users,dc=example,dc=com
   objectClass: inetOrgPerson
   uid: jdoe
   cn: John Doe
   sn: Doe
   userPassword: password123
   ```

---

## Step 2 — Start the Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

**Edit `.env`** to match your Apache DS settings:
```env
LDAP_URL=ldap://localhost:10389
LDAP_BASE_DN=dc=example,dc=com
LDAP_USER_OU=ou=users,dc=example,dc=com
LDAP_ADMIN_DN=uid=admin,ou=system
LDAP_ADMIN_PASSWORD=secret
JWT_SECRET=change_this_to_something_secret
```

---

## Step 3 — Start the Frontend

```bash
cd frontend
npm install
npm start          # starts on http://localhost:3000
```

---

## Usage

| Route         | Description                              |
|---------------|------------------------------------------|
| `/`           | Login selector (Regular or LDAP)         |
| `/login`      | Regular login (local accounts)           |
| `/ldap-login` | LDAP login (Apache Directory Server)     |
| `/dashboard`  | Protected dashboard (requires login)     |

### Regular Login Demo Accounts
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |
| john     | john123   | user  |
| jane     | jane123   | user  |

### LDAP Login
Use any user you created in Apache Directory Server under `ou=users,dc=example,dc=com`.

---

## API Endpoints

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/auth/login       | Regular login          |
| POST   | /api/auth/ldap-login  | LDAP login             |
| GET    | /api/auth/me          | Get current user (JWT) |
| GET    | /api/health           | Server health check    |

### Request body (both login endpoints)
```json
{ "username": "jdoe", "password": "yourpassword" }
```

### Response
```json
{
  "message": "Login successful.",
  "token": "<JWT>",
  "user": {
    "username": "jdoe",
    "name": "John Doe",
    "authType": "ldap"
  }
}
```

---

## How LDAP Auth Works

1. Frontend sends `{ username, password }` to `/api/auth/ldap-login`
2. Backend builds the user DN: `uid=<username>,ou=users,dc=example,dc=com`
3. Backend calls `client.bind(userDN, password)` on Apache DS
4. If bind **succeeds** → user is authenticated → JWT issued
5. If bind **fails** → `InvalidCredentialsError` → 401 returned
6. Frontend stores JWT and redirects to Dashboard
