const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || true  // Use env variable or allow all initially
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Vehicle Tax API is running!' });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/exchange", require("./routes/exchange.routes")); 

require('./jobs/exchangeRates.cron');

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;