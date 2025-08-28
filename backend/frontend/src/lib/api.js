import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling and token expiration
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handle token expiration
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    }
    
    console.error(err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// Authentication APIs
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerAgent = (data) => api.post("/auth/register", data);

// Vehicle APIs
export const fetchVehicles = () => api.get("/vehicles");
export const addVehicle = (vehicleData) => api.post("/vehicles", vehicleData);
export const updateVehicle = (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
export const bulkUpdateExchangeRate = (exchangeRateData) => api.post("/vehicles/bulk-update-exchange-rate", exchangeRateData);

// Exchange Rate APIs
export const getExchangeRates = () => api.get("/exchange");
export const updateExchangeRates = (rates) => api.post("/exchange/update", rates);

// User Profile API
export const getUserProfile = () => api.get("/auth/me");

export default api;