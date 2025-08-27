import axios from "axios";

// ✅ Dynamically pick API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

// ✅ Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle expired tokens & unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      window.location.href = "/login"; // Redirect to login page
    }
    console.error(error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------- AUTH ROUTES ----------
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerAgent = (data) => api.post("/auth/register", data);
export const getUserProfile = () => api.get("/auth/me");

// ---------- VEHICLE ROUTES ----------
export const fetchVehicles = () => api.get("/vehicles");
export const addVehicle = (vehicleData) => api.post("/vehicles", vehicleData);
export const updateVehicle = (id, vehicleData) =>
  api.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
export const bulkUpdateExchangeRate = (exchangeRateData) =>
  api.post("/vehicles/bulk-update-exchange-rate", exchangeRateData);

// ---------- EXCHANGE ROUTES ----------
export const getExchangeRates = () => api.get("/exchange");
export const updateExchangeRates = (rates) =>
  api.post("/exchange/update", rates);

export default api;
