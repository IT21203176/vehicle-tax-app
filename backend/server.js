const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://vehicle-tax-app.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: "Vehicle Taxation API is running",
    activeStatus: true,
    error: false,
    timestamp: new Date().toISOString()
  });
});

// Database connection (serverless-friendly)
let dbConnected = false;
const connectDB = async () => {
  if (dbConnected) return;
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB connection error:', error);
  }
};

// Connect to DB on each request (serverless pattern)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/exchange", require("./routes/exchange.routes"));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// Export for Vercel
module.exports = app;