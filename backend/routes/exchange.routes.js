const express = require("express");
const router = express.Router();
const { updateVehicleRates } = require("../services/exchange.service");
const { protect, requireRole } = require("../middleware/authMiddleware");

// Only ADMIN can manually update rates
router.post("/update", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    await updateVehicleRates();
    res.json({ message: "Exchange rates updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update exchange rates" });
  }
});

module.exports = router;