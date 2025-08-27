const mongoose = require("mongoose");

// Sub-schema for price calculations
const priceCalculationSchema = new mongoose.Schema({
  priceType: {
    type: String,
    enum: ['yellowBook', 'webValue'],
    required: true
  },
  priceValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Calculated fields for this price type
  tax: {
    type: Number,
    default: 0
  },
  dipFOB: {
    type: Number,
    default: 0
  },
  cifJPY: {
    type: Number,
    default: 0
  },
  cifLKR: {
    type: Number,
    default: 0
  },
  generalDuty: {
    type: Number,
    default: 0
  },
  surcharge: {
    type: Number,
    default: 0
  },
  pPerCM3LKR: {
    type: Number,
    default: 0
  },
  vat: {
    type: Number,
    default: 0
  },
  luxuryTax: {
    type: Number,
    default: 0
  },
  luxuryTaxCalculation: {
    type: Number,
    default: 0
  },
  cifJPY1: {
    type: Number,
    default: 0
  },
  cifLKR1: {
    type: Number,
    default: 0
  },
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  // Common fields (same for all price types)
  hsCode: String,
  vehicleType: String,
  fuelType: String,
  engineCC: {
    type: Number,
    min: 0
  },
  
  // Common calculation inputs
  freight: {
    type: Number,
    default: 0,
    min: 0
  },
  insurance: {
    type: Number,
    default: 0,
    min: 0
  },
  other: {
    type: Number,
    default: 0,
    min: 0
  },
  cm3: {
    type: Number,
    default: 0,
    min: 0
  },
  pPerUnitLKR: {
    type: Number,
    default: 0,
    min: 0
  },
  pPerCM3LKR: {
    type: Number,
    default: 0,
    min: 0
  },
  pal: {
    type: Number,
    default: 0,
    min: 0
  },
  ssl: {
    type: Number,
    default: 0,
    min: 0
  },
  rateCurrency: String,
  exchangeRate: {
    type: Number,
    default: 1,
    min: 0.01
  },
  generalDutyRate: {
    type: Number,
    default: 0.2,
    min: 0
  },
  surchargeRate: {
    type: Number,
    default: 0.5,
    min: 0
  },
  vatRate: {
    type: Number,
    default: 0.18,
    min: 0
  },
  luxTaxFD: {
    type: Number,
    default: 0,
    min: 0
  },
  luxuryTaxRateValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Array of price calculations
  priceCalculations: [priceCalculationSchema],
  
  manufacturer: String, // Auto-extracted manufacturer name
}, {
  timestamps: true
});

// Pre-save middleware to extract manufacturer
vehicleSchema.pre('save', function(next) {
  if (this.vehicleType && typeof this.vehicleType === 'string') {
    const upperVehicleType = this.vehicleType.toUpperCase();
    
    const manufacturers = [
      'TOYOTA', 'HONDA', 'SUZUKI', 'NISSAN', 'MAZDA', 'HYUNDAI', 
      'BMW', 'MERCEDES-BENZ', 'MERCEDES', 'KIA', 'DAIHATSU', 
      'SUBARU', 'MITSUBISHI', 'LEXUS', 'ISUZU', 'AUDI', 'VOLKSWAGEN'
    ];
    
    for (const brand of manufacturers) {
      if (upperVehicleType.startsWith(brand)) {
        this.manufacturer = brand;
        break;
      }
    }
    
    if (!this.manufacturer) {
      for (const brand of manufacturers) {
        if (upperVehicleType.includes(brand)) {
          this.manufacturer = brand;
          break;
        }
      }
    }
    
    if (!this.manufacturer) {
      this.manufacturer = 'UNKNOWN';
    }
  }
  
  next();
});

module.exports = mongoose.model("Vehicle", vehicleSchema);