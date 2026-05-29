import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const isLDAP           = user?.authType === "ldap";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="dash-root">
      <div className="dash-bg-glow" />
      <div className="grid-bg" />

      {/* Top Nav */}
      <nav className="dash-nav">


        <div className="dash-nav-right">
          <div className={`auth-type-pill ${isLDAP ? "ldap" : "regular"}`}>
            {isLDAP ? "🔐 LDAP Session" : "👤 Regular Session"}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="dash-main">
        {/* Welcome hero */}
        <section className="dash-hero">
          <div className="dash-time">{time}</div>
          <h1 className="dash-welcome">
            Good to see you,<br />
            <span className={isLDAP ? "accent-ldap" : "accent-regular"}>
              {user?.name || user?.username}
            </span>
          </h1>
          <p className="dash-date">{date}</p>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
