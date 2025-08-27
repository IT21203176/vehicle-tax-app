const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle'); 
const calculateTax = require('./utils/calculateTax'); 
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function importExcelToMongoDB(filePath) {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${jsonData.length} rows in Excel file`);
    
    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Map Excel columns to your schema
        const vehicleData = mapExcelRowToVehicle(row);
        
        // Calculate taxes for the vehicle
        const calculatedData = calculateTax(vehicleData);
        
        // Merge calculated data back into vehicle data
        vehicleData.priceCalculations = calculatedData.priceCalculations;
        
        // Create and save vehicle
        const vehicle = new Vehicle(vehicleData);
        await vehicle.save();
        
        console.log(`✓ Imported row ${i + 1}: ${vehicleData.vehicleType}`);
        
      } catch (error) {
        console.error(`✗ Error importing row ${i + 1}:`, error.message);
        console.log('Row data:', row);
      }
    }
    
    console.log('Import completed!');
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

function mapExcelRowToVehicle(row) {
  // Map your Excel column names to the Vehicle schema
  // Adjust these column names based on your Excel file structure
  
  const vehicleData = {
    // Basic vehicle info
    hsCode: row['HS Code'] || row['hsCode'] || '',
    vehicleType: row['Vehicle Type'] || row['vehicleType'] || '',
    fuelType: row['Fuel Type'] || row['fuelType'] || '',
    engineCC: parseFloat(row['Engine CC'] || row['engineCC'] || 0),
    
    // Cost components
    freight: parseFloat(row['Freight'] || row['freight'] || 0),
    insurance: parseFloat(row['Insurance'] || row['insurance'] || 0),
    other: parseFloat(row['Other'] || row['other'] || 0),
    cm3: parseFloat(row['CM3'] || row['cm3'] || 0),
    
    // Tax parameters
    pPerUnitLKR: parseFloat(row['P Per Unit LKR'] || row['pPerUnitLKR'] || 0),
    pPerCM3LKR: parseFloat(row['P Per CM3 LKR'] || row['pPerCM3LKR'] || 0),
    pal: parseFloat(row['PAL'] || row['pal'] || 0),
    ssl: parseFloat(row['SSL'] || row['ssl'] || 0),
    
    // Rates and currency
    rateCurrency: row['Rate Currency'] || row['rateCurrency'] || 'JPY',
    exchangeRate: parseFloat(row['Exchange Rate'] || row['exchangeRate'] || 1),
    generalDutyRate: parseFloat(row['General Duty Rate'] || row['generalDutyRate'] || 0.2),
    surchargeRate: parseFloat(row['Surcharge Rate'] || row['surchargeRate'] || 0.5),
    vatRate: parseFloat(row['VAT Rate'] || row['vatRate'] || 0.18),
    luxTaxFD: parseFloat(row['Lux Tax FD'] || row['luxTaxFD'] || 0),
    luxuryTaxRateValue: parseFloat(row['Luxury Tax Rate'] || row['luxuryTaxRateValue'] || 0),
    
    // Price calculations array
    priceCalculations: []
  };
  
  // Handle price values - check for both Yellow Book and Web Value
  const yellowBookPrice = parseFloat(row['Yellow Book Price'] || row['yellowBookPrice'] || 0);
  const webValuePrice = parseFloat(row['Web Value Price'] || row['webValuePrice'] || 0);
  
  if (yellowBookPrice > 0) {
    vehicleData.priceCalculations.push({
      priceType: 'yellowBook',
      priceValue: yellowBookPrice
    });
  }
  
  if (webValuePrice > 0) {
    vehicleData.priceCalculations.push({
      priceType: 'webValue',
      priceValue: webValuePrice
    });
  }
  
  // If no specific prices found, check for a general price column
  if (vehicleData.priceCalculations.length === 0) {
    const generalPrice = parseFloat(row['Price'] || row['price'] || row['Price Value'] || 0);
    if (generalPrice > 0) {
      vehicleData.priceCalculations.push({
        priceType: 'yellowBook', // Default to yellowBook
        priceValue: generalPrice
      });
    }
  }
  
  return vehicleData;
}

// Usage
const excelFilePath = './data/vehicles.xlsx'; 
importExcelToMongoDB(excelFilePath);

// Alternative: Import from command line argument
//const filePath = process.argv[2];
// if (!filePath) {
//   console.error('Please provide Excel file path as argument');
//   console.log('Usage: node importExcel.js path/to/your/file.xlsx');
//   process.exit(1);
// }
// importExcelToMongoDB(filePath);