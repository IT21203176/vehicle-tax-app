const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (important for Vercel)
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Initialize database connection
let dbConnected = false;

const initializeApp = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    dbConnected = false;
  }
};

// Initialize on startup
initializeApp();

// Middleware to check database connection
app.use((req, res, next) => {
  if (!dbConnected && req.path !== '/') {
    return res.status(503).json({ 
      message: "Database connection not available",
      error: "Service temporarily unavailable"
    });
  }
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Handle other routes conditionally
try {
  app.use("/api/vehicles", require("./routes/vehicleRoutes"));
} catch (error) {
  console.log('Vehicle routes not available:', error.message);
}

try {
  app.use("/api/exchange", require("./routes/exchange.routes"));
} catch (error) {
  console.log('Exchange routes not available:', error.message);
}

// Initialize cron jobs conditionally
try {
  require('./jobs/exchangeRates.cron');
} catch (error) {
  console.log('Cron jobs not available:', error.message);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl
  });
});

module.exports = app;