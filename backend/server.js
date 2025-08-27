const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const vercelExpress = require("@vercel/node-express"); // <-- wrap for Vercel

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://diason-vehicle-tax-app.vercel.app/"
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

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Vehicle Taxation API is running 🚀" });
});

// Export app for Vercel
module.exports = vercelExpress(app);
