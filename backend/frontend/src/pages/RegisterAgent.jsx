import React, { useState } from "react";
import { registerAgent } from "../lib/api";
import { useNavigate } from "react-router-dom";
import "./RegisterAgent.css";

const RegisterAgent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const dataToSend = { ...formData, role: "AGENT" };
      
      await registerAgent(dataToSend);
      
      setSuccess("Agent registered successfully!");
      setFormData({
        name: "",
        email: "",
        password: ""
      });
      
      // Redirect after successful registration
      setTimeout(() => {
        navigate("/vehicles");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <button
            className="back-button"
            onClick={() => navigate("/vehicles")}
            disabled={loading}
          >
            ← Back to Vehicles
          </button>
          
          <img 
            src="/DIE.png" 
            alt="Diason Imports & Exports Logo" 
            className="register-logo"
          />
          
          <h1 className="page-title">Register New Agent</h1>
          <p className="page-subtitle">Create a new clearing agent account for the system</p>
        </div>

        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-alert">
              <div className="error-icon">⚠</div>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="success-alert">
              <div className="success-icon">✓</div>
              <span>{success}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="Enter agent's full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter agent's email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="form-input"
                placeholder="Enter password (minimum 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="form-hint">
                Password must be at least 6 characters long
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="register-button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Registering...
                </>
              ) : (
                <>
                  <div className="register-icon">+</div>
                  Register Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAgent;