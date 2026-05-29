import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./AuthForm.css";

const RegularLogin = () => {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="10" cy="7" r="3.5"/>
                  <path d="M2.5 18c0-4 3.4-7 7.5-7s7.5 3 7.5 7"/>
                </svg>
              </span>
              <input
                className="field-input"
                type="text"
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="9" width="14" height="9" rx="2"/>
                  <path d="M6 9V6a4 4 0 0 1 8 0v3"/>
                </svg>
              </span>
              <input
                className="field-input"
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass((v) => !v)}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="submit-btn regular" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
    </>
  );
};

export default RegularLogin;
