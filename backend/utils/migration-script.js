// migration-script.js - Run this once to migrate existing data
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle'); // Adjust path as needed

const migrationScript = async () => {
  try {
    console.log('Starting migration...');
    
    // Find all vehicles that don't have priceCalculations array
    const vehiclesToMigrate = await Vehicle.find({
      $or: [
        { priceCalculations: { $exists: false } },
        { priceCalculations: { $size: 0 } }
      ]
    });

    console.log(`Found ${vehiclesToMigrate.length} vehicles to migrate`);

    for (const vehicle of vehiclesToMigrate) {
      // Create priceCalculations array from old structure
      const priceCalculations = [];
      
      if (vehicle.yellowBookPrice && vehicle.yellowBookPrice > 0) {
        priceCalculations.push({
          priceType: vehicle.priceType || 'yellowBook',
          priceValue: vehicle.yellowBookPrice,
          // Copy over calculated fields if they exist
          tax: vehicle.tax,
          dipFOB: vehicle.dipFOB,
          cifJPY: vehicle.cifJPY,
          cifLKR: vehicle.cifLKR,
          generalDuty: vehicle.generalDuty,
          surcharge: vehicle.surcharge,
          pPerCM3LKR: vehicle.pPerCM3LKR,
          vat: vehicle.vat,
          luxuryTax: vehicle.luxuryTax,
          luxuryTaxCalculation: vehicle.luxuryTaxCalculation,
          cifJPY1: vehicle.cifJPY1,
          cifLKR1: vehicle.cifLKR1,
        });
      }

      // Update the vehicle with new structure
      if (priceCalculations.length > 0) {
        await Vehicle.findByIdAndUpdate(vehicle._id, {
          $set: { priceCalculations },
          $unset: {
            // Remove old fields that are now in priceCalculations
            yellowBookPrice: 1,
            priceType: 1,
            tax: 1,
            dipFOB: 1,
            cifJPY: 1,
            cifLKR: 1,
            generalDuty: 1,
            surcharge: 1,
            pPerCM3LKR: 1,
            vat: 1,
            luxuryTax: 1,
            luxuryTaxCalculation: 1,
            cifJPY1: 1,
            cifLKR1: 1,
          }
        });
        
        console.log(`Migrated vehicle: ${vehicle.vehicleType} (${vehicle._id})`);
      } else {
        console.log(`Skipped vehicle with no price data: ${vehicle.vehicleType} (${vehicle._id})`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run migration (uncomment to execute)
// migrationScript();

module.exports = migrationScript;