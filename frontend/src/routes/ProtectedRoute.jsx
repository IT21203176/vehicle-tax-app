import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roles = [], children }) => {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Normalize role
  role = role ? role.toUpperCase() : "";

  // If roles array is empty, allow access
  if (roles.length > 0 && !roles.includes(role)) {
    // Optional: redirect to a "Not Authorized" page instead
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;