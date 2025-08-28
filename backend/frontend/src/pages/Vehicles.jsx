// frontend\src\pages\Vehicles.jsx
import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api from "../lib/api";
import "./Vehicles.css";
import Navigation from "../components/Navigation";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userRole = localStorage.getItem("role");

  const fetchVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (vehicleId) => {
    // Find the vehicle to get its details for confirmation
    const vehicle = vehicles.find(v => v._id === vehicleId);
    
    if (!vehicle) {
      setError("Vehicle not found for deletion.");
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${vehicle.vehicleType || 'this vehicle'}?`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        await api.delete(`/vehicles/${vehicleId}`);
        
        // Remove vehicle from state immediately instead of refetching
        setVehicles(prevVehicles => 
          prevVehicles.filter(v => v._id !== vehicleId)
        );
        
        setError("");
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        if (err.response?.status === 400) {
          setError("Invalid vehicle ID. Please try again.");
        } else if (err.response?.status === 404) {
          setError("Vehicle not found. It may have already been deleted.");
          // Refresh the list to sync with server
          fetchVehicles();
        } else {
          setError("Failed to delete vehicle. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const openExchangeRates = () => {
    window.open("https://www.customs.gov.lk/exchange-rates/", "_blank");
  };

  return (
    <div className="vehicles-container">
      
      <header className="vehicles-header" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <img 
          src="/DIE.png" 
          alt="Diason Imports & Exports Logo" 
          style={{ width: "70px", height: "70px", objectFit: "contain" }} 
        />
        <div className="header-button">
          <h2>Diason Imports & Exports - Vehicle Taxation Reader</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="vehicles-controls">
          <div className="controls-row">
            {/* Exchange Rate Button */}
            <button
              className="exchange-rate-btn"
              onClick={openExchangeRates}
            >
              View Exchange Rates
            </button>
            
            <Navigation/>
          </div>
        </div>

        
        </div>
      </header>

      <main className="vehicles-content">
        {loading && <div className="loading-message">Loading vehicles...</div>}
        
        {!loading && vehicles.length === 0 && (
          <div className="no-vehicles">
            No vehicles available. {userRole === "ADMIN" && "Click 'Add Vehicle' to get started."}
          </div>
        )}

        {!loading && (
          <DataTable
            data={vehicles}   
            role={userRole}
            onDelete={handleDelete}
            onRefresh={fetchVehicles}
          />
        )}
      </main>
    </div>
  );
};

export default Vehicles;