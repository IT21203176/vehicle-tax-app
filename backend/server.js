const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✅ Allow frontend on Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "https://diason-vehicle-tax-app.vercel.app/" // <-- Replace with final domain
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
// app.use("/api/exchange", require("./routes/exchange.routes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Vehicle Taxation API is running 🚀" });
});

const PORT = process.env.PORT || 5000;

// ✅ Only start server locally
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;