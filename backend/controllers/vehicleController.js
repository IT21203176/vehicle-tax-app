// backend\controllers\vehicleController.js
const Vehicle = require("../models/Vehicle");
const calculateTax = require("../utils/calculateTax");
const { extractManufacturer } = require("../utils/manufacturerExtractor");
const mongoose = require("mongoose");

// Create Vehicle
exports.createVehicle = async (req, res) => {
  try {
    const data = req.body;

    // Extract manufacturer from vehicleType
    const manufacturer = extractManufacturer(data.vehicleType);
    
    // Validate price calculations
    if (!data.priceCalculations || !Array.isArray(data.priceCalculations) || data.priceCalculations.length === 0) {
      return res.status(400).json({ message: "At least one price calculation is required" });
    }

    // Calculate tax data for all price types
    const taxData = calculateTax(data);

    const vehicle = new Vehicle({
      ...data,
      ...taxData,
      manufacturer // Add extracted manufacturer
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const updatedData = { ...vehicle.toObject(), ...req.body };
    
    // Re-extract manufacturer if vehicleType was updated
    if (req.body.vehicleType) {
      updatedData.manufacturer = extractManufacturer(req.body.vehicleType);
    }
    
    // Validate price calculations
    if (updatedData.priceCalculations && Array.isArray(updatedData.priceCalculations) && updatedData.priceCalculations.length > 0) {
      // Recalculate tax data for all price types
      const taxData = calculateTax(updatedData);
      Object.assign(updatedData, taxData);
    }

    // Update all fields
    Object.assign(vehicle, updatedData);
    await vehicle.save();

    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id exists and is a valid ObjectId
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }
    
    // Additional validation for ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }
    
    const vehicle = await Vehicle.findByIdAndDelete(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: vehicle
    });
    
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle'
    });
  }
};

// Get Vehicles by Manufacturer
exports.getVehiclesByManufacturer = async (req, res) => {
  try {
    const { manufacturer } = req.params;
    const vehicles = await Vehicle.find({ 
      manufacturer: manufacturer.toUpperCase() 
    });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all unique manufacturers
exports.getManufacturers = async (req, res) => {
  try {
    const manufacturers = await Vehicle.distinct('manufacturer');
    res.json(manufacturers.filter(m => m && m !== 'UNKNOWN'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Bulk update vehicles with new exchange rate
exports.bulkUpdateExchangeRate = async (req, res) => {
  try {
    const { exchangeRate, currency } = req.body;

    if (!exchangeRate || exchangeRate <= 0) {
      return res.status(400).json({ message: "Valid exchange rate is required" });
    }

    // Get all vehicles
    const vehicles = await Vehicle.find();

    if (vehicles.length === 0) {
      return res.json({ message: "No vehicles found to update", updatedCount: 0 });
    }

    const updatePromises = vehicles.map(async (vehicle) => {
      // Create updated vehicle data with new exchange rate
      const updatedData = {
        ...vehicle.toObject(),
        exchangeRate: exchangeRate,
        rateCurrency: currency || vehicle.rateCurrency
      };

      // Recalculate tax data for all price types
      const taxData = calculateTax(updatedData);
      Object.assign(updatedData, taxData);

      // Update the vehicle
      return Vehicle.findByIdAndUpdate(
        vehicle._id,
        updatedData,
        { new: true, runValidators: true }
      );
    });

    const updatedVehicles = await Promise.all(updatePromises);

    res.json({
      message: `Successfully updated ${updatedVehicles.length} vehicles with new exchange rate`,
      updatedCount: updatedVehicles.length,
      exchangeRate: exchangeRate,
      currency: currency
    });
  } catch (err) {
    console.error('Error in bulk exchange rate update:', err);
    res.status(500).json({ message: "Server Error during bulk update" });
  }
};