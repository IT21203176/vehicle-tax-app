const calculateTaxForPrice = (vehicle, priceValue, priceType) => {
  const freight = vehicle.freight || 0;
  const insurance = vehicle.insurance || 0;
  const other = vehicle.other || 0;
  const cm3 = vehicle.cm3 || 0;

  const pUnit = vehicle.pPerUnitLKR || 0;
  const pPerCM3 = vehicle.pPerCM3LKR || 0;

  const exchangeRate = vehicle.exchangeRate || 1;
  const generalDutyRate = vehicle.generalDutyRate || 0.2;
  const surchargeRate = vehicle.surchargeRate || 0.5;
  const vatRate = vehicle.vatRate || 0.18;
  
  // Ensure luxTaxFD is properly handled - should be 0 if not provided, not undefined
  const luxTaxFD = parseFloat(vehicle.luxTaxFD) || 0;
  const luxuryRate = parseFloat(vehicle.luxuryTaxRateValue) || 0;

  const pal = vehicle.pal || 0;
  const ssl = vehicle.ssl || 0;

  // Calculate DIP FOB based on priceType
  let dipFOB;
  if (priceType === 'yellowBook') {
    dipFOB = priceValue * 0.85;
  } else if (priceType === 'webValue') {
    dipFOB = (priceValue * 100 / 110) * 0.85;
  }

  // 11. CIF JPY = DIP FOB + Freight + Insurance + Other
  const cifJPY = dipFOB + freight + insurance + other;

  // 12. CIF LKR = CIF JPY * Exchange Rate
  const cifLKR = cifJPY * exchangeRate;

  // 14. General Duty
  const generalDuty = cifLKR * generalDutyRate;

  // 15. Surcharge
  const surcharge = generalDuty * surchargeRate;

  // 17. P/cm3 LKR
  const pCM3LKR = cm3 * pPerCM3;

  // 23. CIF JPY1 (without Other) - Calculate this before VAT
  const cifJPY1 = dipFOB + freight + insurance;

  // 24. CIF LKR1
  const cifLKR1 = cifJPY1 * exchangeRate;

  // 21. Luxury Tax Calculation and Luxury Tax
  const luxuryTaxCalculation = cifLKR1 - luxTaxFD;
  const luxuryTax = (luxuryTaxCalculation > 0 && luxuryRate > 0) ? luxuryTaxCalculation * luxuryRate : 0;

  // 20. VAT (calculated after luxury tax calculation)
  const vat =
    ((cifLKR * 0.1) + cifLKR + generalDuty + surcharge + pUnit + pCM3LKR + pal + ssl) * vatRate;

  // Total Tax
  const totalTax =
    generalDuty +
    surcharge +
    pUnit +
    pCM3LKR +
    pal +
    ssl +
    vat +
    luxuryTax +
    1750 +
    15000;

  return {
    dipFOB: parseFloat(dipFOB.toFixed(2)),
    cifJPY: parseFloat(cifJPY.toFixed(2)),
    cifLKR: parseFloat(cifLKR.toFixed(2)),
    generalDuty: parseFloat(generalDuty.toFixed(2)),
    surcharge: parseFloat(surcharge.toFixed(2)),
    pCM3LKR: parseFloat(pCM3LKR.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    luxuryTax: parseFloat(luxuryTax.toFixed(2)),
    luxuryTaxCalculation: parseFloat(luxuryTaxCalculation.toFixed(2)),
    tax: parseFloat(totalTax.toFixed(2)),
    cifJPY1: parseFloat(cifJPY1.toFixed(2)),
    cifLKR1: parseFloat(cifLKR1.toFixed(2)),
  };
};

const calculateTax = (vehicle) => {
  // Extract price calculations from the request
  const priceCalculations = vehicle.priceCalculations || [];
  
  // Calculate for each price type
  const calculatedPrices = priceCalculations.map(priceCalc => {
    const calculations = calculateTaxForPrice(vehicle, priceCalc.priceValue, priceCalc.priceType);
    
    return {
      priceType: priceCalc.priceType,
      priceValue: priceCalc.priceValue,
      ...calculations
    };
  });

  return {
    priceCalculations: calculatedPrices
  };
};

module.exports = calculateTax;