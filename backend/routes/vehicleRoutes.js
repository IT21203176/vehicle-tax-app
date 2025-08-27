const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

const { protect, requireRole } = require("../middleware/authMiddleware");

// Create vehicle (Admin only)
router.post(
  "/",
  protect,
  requireRole("ADMIN"),
  vehicleController.createVehicle
);

// Update vehicle (Admin only)
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  vehicleController.updateVehicle
);

// Delete vehicle (Admin only)
router.delete(
  "/:id",
  protect,
  requireRole("ADMIN"),
  vehicleController.deleteVehicle
);

// Bulk update exchange rate (Both Admin and Agent can use)
router.post(
  "/bulk-update-exchange-rate",
  protect,
  vehicleController.bulkUpdateExchangeRate
);

// Get all vehicles (Protected)
router.get("/", protect, vehicleController.getVehicles);

// Get unique manufacturers (Protected)
router.get("/manufacturers", protect, vehicleController.getManufacturers);

// Get vehicles by manufacturer (Protected)
router.get("/manufacturer/:manufacturer", protect, vehicleController.getVehiclesByManufacturer);

// Get vehicle by ID (Protected)
router.get("/:id", protect, vehicleController.getVehicleById);

module.exports = router;