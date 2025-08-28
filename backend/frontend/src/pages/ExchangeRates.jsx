import React, { useEffect, useState } from "react";
import api from "../lib/api";

const ExchangeRates = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  // Fetch all vehicles and rates
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vehicle data");
    } finally {
      setLoading(false);
    }
  };

  // Admin manual update
  const handleUpdateRates = async () => {
    try {
      setUpdating(true);
      await api.post("/exchange/update");
      await fetchVehicles(); // Refresh rates after update
      alert("Exchange rates updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update rates");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h1>Exchange Rates</h1>
      {role === "ADMIN" && (
        <button onClick={handleUpdateRates} disabled={updating}>
          {updating ? "Updating..." : "Update Rates"}
        </button>
      )}
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>JPY</th>
            <th>GBP</th>
            <th>USD</th>
            <th>THB</th>
            <th>AUD</th>
            <th>CIF JPY</th>
            <th>CIF LKR</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v._id}>
              <td>{v.vehicleType}</td>
              <td>{v.jpy.toFixed(2)}</td>
              <td>{v.gbp.toFixed(2)}</td>
              <td>{v.usd.toFixed(2)}</td>
              <td>{v.thb.toFixed(2)}</td>
              <td>{v.aud.toFixed(2)}</td>
              <td>{v.cifJPY.toFixed(2)}</td>
              <td>{v.cifLKR.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeRates;
