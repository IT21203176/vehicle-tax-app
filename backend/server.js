const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();

// CORS options
const corsOptions = {
  origin: "http://diason-vehicle-taxation.netlify.app", // allow only this frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
  credentials: true, // if you need cookies
};

app.use(cors(corsOptions)); // apply CORS with options
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/exchange", require("./routes/exchange.routes")); 
app.get('/', (req, res) => {
    res.send({
        activeStatus: true,
        error: false,
    })
})

require('./jobs/exchangeRates.cron');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
