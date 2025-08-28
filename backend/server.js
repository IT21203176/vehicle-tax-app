const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config();

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================
// API Routes
// ============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/exchange", require("./routes/exchange.routes")); 

// Optional cron job
// require('./jobs/exchangeRates.cron');

// ============================
// Serve Frontend Static Files
// ============================
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));


// ============================
// Start Server
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));