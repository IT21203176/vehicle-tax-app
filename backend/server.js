const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors");
const serverless = require("serverless-http")
const path = require("path");

// Load env variables
dotenv.config();

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middlewares
app.use(bodyParser.json())
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

// ============================
// API Routes
// ============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
//app.use("/api/exchange", require("./routes/exchange.routes")); 

// Optional cron job
// require('./jobs/exchangeRates.cron');

// ============================
// Serve Frontend Static Files
// ============================

module.exports = app
module.exports.handler = serverless(app)