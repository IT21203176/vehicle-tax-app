import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import RegisterAgent from "../pages/RegisterAgent";
import Vehicles from "../pages/Vehicles";
import VehicleForm from "../pages/VehicleForm";
import ExchangeRates from "../pages/ExchangeRates";

const AppRoutes = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <div className={token ? "pt-4" : ""}>
        <Routes>
          {/* Redirect root to login or vehicles based on auth status */}
          <Route 
            path="/" 
            element={
              token ? <Navigate to="/vehicles" replace /> : <Navigate to="/login" replace />
            } 
          />

          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Register Agent (Admin only) */}
          <Route
            path="/register-agent"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <RegisterAgent />
              </ProtectedRoute>
            }
          />

          {/* Vehicles (Admin + Agent) */}
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT"]}>
                <Vehicles />
              </ProtectedRoute>
            }
          />

          {/* Add new vehicle (Admin only) */}
          <Route
            path="/vehicles/new"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehicleForm />
              </ProtectedRoute>
            }
          />

          {/* Exchange rates (Admin + Agent) */}
          <Route
            path="/exchange-rates"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT"]}>
                <ExchangeRates />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes;