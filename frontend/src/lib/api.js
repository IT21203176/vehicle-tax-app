import axios from "axios";

// Determine base URL based on environment
const getBaseURL = () => {
  // Check if we're in development
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return "http://localhost:5000/api";
  }
  
  // Production - use environment variable or fallback to your Vercel URL
  return import.meta.env.VITE_API_URL || "https://vehicle-tax-app.vercel.app/api";
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
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
      
      // Only redirect if we're not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Log error details for debugging
    console.error("API Error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: {
        method: err.config?.method,
        url: err.config?.url,
        baseURL: err.config?.baseURL
      }
    });
    
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

// Health check API
export const healthCheck = () => api.get("/");

export default api;