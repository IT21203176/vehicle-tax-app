// backend/utils/manufacturerExtractor.js

/**
 * Utility function to extract manufacturer from vehicle type string
 * @param {string} vehicleType - The vehicle type string
 * @returns {string|null} - The extracted manufacturer name or null
 */
const extractManufacturer = (vehicleType) => {
  if (!vehicleType || typeof vehicleType !== 'string') {
    return null;
  }

  // Convert to uppercase for comparison
  const upperVehicleType = vehicleType.toUpperCase().trim();
  
  // Define manufacturers in order of priority (longer names first to avoid conflicts)
  const manufacturers = [
    'MERCEDES-BENZ',
    'MERCEDES',
    'VOLKSWAGEN',
    'MITSUBISHI',
    'DAIHATSU',
    'HYUNDAI',
    'TOYOTA',
    'HONDA',
    'SUZUKI',
    'NISSAN',
    'MAZDA',
    'SUBARU',
    'LEXUS',
    'ISUZU',
    'AUDI',
    'BMW',
    'KIA',
  ];

  // First, check if manufacturer appears at the start of the string
  for (const manufacturer of manufacturers) {
    if (upperVehicleType.startsWith(manufacturer)) {
      return manufacturer;
    }
  }

  // If not found at start, check if it appears anywhere in the string
  for (const manufacturer of manufacturers) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${manufacturer}\\b`, 'i');
    if (regex.test(vehicleType)) {
      return manufacturer;
    }
  }

  return null;
};

/**
 * Get manufacturer information including logo and website
 * @param {string} manufacturerName - The manufacturer name
 * @returns {Object|null} - Manufacturer info object or null
 */
const getManufacturerInfo = (manufacturerName) => {
  const manufacturersData = {
    TOYOTA: {
      name: "Toyota",
      logo: "/images/logos/toyota.png",
      website: "https://www.toyota.co.jp/grade/dc/top",
    },
    HONDA: {
      name: "Honda",
      logo: "/images/logos/honda.png",
      website: "https://grade.customer.honda.co.jp/apps/grade/hccg0010101/agree",
    },
    SUZUKI: {
      name: "Suzuki",
      logo: "/images/logos/suzuki.png",
      website: "https://sgre.suzuki.co.jp/SearchGrade",
    },
    NISSAN: {
      name: "Nissan",
      logo: "/images/logos/nissan.png",
      website: "https://grade-search.nissan.co.jp/GRADE/search.html",
    },
    MAZDA: {
      name: "Mazda",
      logo: "/images/logos/mazda.png",
      website: "https://support.mazda.co.jp/grade-search/search.html",
    },
    HYUNDAI: {
      name: "Hyundai",
      logo: "/images/logos/hyundai.png",
      website: "https://www.hyundai.com/",
    },
    BMW: {
      name: "BMW",
      logo: "/images/logos/bmw.png",
      website: "https://www.bmw.com/",
    },
    MERCEDES: {
      name: "Mercedes Benz",
      logo: "/images/logos/mercedes.png",
      website: "https://www.mercedes-benz.com/",
    },
    'MERCEDES-BENZ': {
      name: "Mercedes Benz",
      logo: "/images/logos/mercedes.png",
      website: "https://www.mercedes-benz.com/",
    },
    KIA: {
      name: "KIA",
      logo: "/images/logos/kia.png",
      website: "https://www.kia.com/",
    },
    DAIHATSU: {
      name: "Daihatsu",
      logo: "/images/logos/daihatsu.png",
      website: "https://inquiry.daihatsu.co.jp/gradeweb/",
    },
    SUBARU: {
      name: "Subaru",
      logo: "/images/logos/subaru.png",
      website: "https://grade-search.subaru.jp/luw/",
    },
    MITSUBISHI: {
      name: "Mitsubishi",
      logo: "/images/logos/mitsubishi.png",
      website: "https://inquiry.mitsubishi-motors.co.jp/reference/GradeSearch.do",
    },
    LEXUS: {
      name: "Lexus",
      logo: "/images/logos/lexus.png",
      website: "https://lexus.jp/",
    },
    ISUZU: {
      name: "Isuzu",
      logo: "/images/logos/isuzu.png",
      website: "https://www.isuzu.co.jp/",
    },
    AUDI: {
      name: "Audi",
      logo: "/images/logos/audi.png",
      website: "https://www.audi.com/",
    },
    VOLKSWAGEN: {
      name: "Volkswagen",
      logo: "/images/logos/volkswagen.png",
      website: "https://www.volkswagen.com/",
    },
  };

  return manufacturersData[manufacturerName?.toUpperCase()] || null;
};

module.exports = {
  extractManufacturer,
  getManufacturerInfo,
};