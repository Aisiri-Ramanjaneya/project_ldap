import React, { useState } from "react";
import RegularLogin from "./RegularLogin";
import LDAPLogin from "./LDAPLogin";
import "./AuthForm.css";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("regular"); // "regular" or "ldap"

  return (
    <div className="auth-root">
      <div className="grid-bg" />

      <div className="auth-container">
        {/* Auth Navbar / Tab Selector */}
        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === "regular" ? "active" : ""}`}
            onClick={() => setActiveTab("regular")}
          >
            Regular Login
          </div>
          <div
            className={`auth-tab ${activeTab === "ldap" ? "active" : ""}`}
            onClick={() => setActiveTab("ldap")}
          >
            LDAP Login
          </div>
        </div>

        {/* Render the appropriate form based on the active tab */}
        {activeTab === "regular" ? <RegularLogin /> : <LDAPLogin />}
      </div>
    </div>
  );
};

export default LoginPage;
