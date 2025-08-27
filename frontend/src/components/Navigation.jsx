import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-white font-bold text-lg"
          >
          </NavLink>

          {/* Right-side navigation: Welcome + Links */}
          <div className="flex items-center space-x-4">
            {userName && (
              <span className="text-sm text-gray-300">
                Welcome, {userName}
              </span>
            )}

            {/* Admin-only link */}
            {userRole === "ADMIN" && (
              <NavLink
                to="/register-agent"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: "white", marginLeft: "30px", marginRight: "30px" }} 
              >
                Register Agent
              </NavLink>
            )}

            {/* Auth Button */}
            {token ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
