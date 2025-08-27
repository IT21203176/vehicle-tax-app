const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env variables FIRST - before any other imports
dotenv.config();

const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/exchange", require("./routes/exchange.routes")); 

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: "Internal server error" });
});

// Start cron jobs
try {
  require('./jobs/exchangeRates.cron');
} catch (error) {
  console.log('Cron jobs not available:', error.message);
}

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables loaded:', {
      MONGO_URI: process.env.MONGO_URI ? 'Present' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing',
      PORT: process.env.PORT || 'Using default'
    });
  });
}

module.exports = app;