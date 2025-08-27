const axios = require('axios');
const Vehicle = require('../models/Vehicle');
const calculateTax = require('../utils/calculateTax');

const CBSL_API = 'https://api.example.com/latestRates';

const fetchExchangeRates = async () => {
  try {
    const response = await axios.get(CBSL_API);
    return response.data; 
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err.message);
    return null;
  }
};

const updateVehicleRates = async () => {
  const rates = await fetchExchangeRates();
  if (!rates) return;

  const vehicles = await Vehicle.find();
  for (let vehicle of vehicles) {
    vehicle.jpy = rates.JPY;
    vehicle.gbp = (rates.JPY * 100 / 110) * 0.85;
    vehicle.usd = rates.USD;
    vehicle.thb = rates.THB;
    vehicle.aud = rates.AUD;
    vehicle.exchangeRate = rates.JPY;

    const taxData = calculateTax(vehicle);
    Object.assign(vehicle, taxData);
    await vehicle.save();
  }
  console.log('Vehicle rates updated successfully.');
};

module.exports = { fetchExchangeRates, updateVehicleRates };