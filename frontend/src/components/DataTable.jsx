import React, { useState, useEffect, useRef } from "react";
import "./DataTable.css";
import manufacturers from "../lib/manufacturers";
import columnLabels from "../lib/columnNames";
import api from "../lib/api";
import SearchBar from "./SearchBar";

const DataTable = ({ data, role, onDelete, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [selectedPriceTypes, setSelectedPriceTypes] = useState(new Set(["yellowBook"]));
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("JPY");
  const [exchangeRates, setExchangeRates] = useState({
    JPY: 1,
    USD: 0.0067,
    THB: 0.24,
    AUD: 0.010,
    INR: 0.56
  });
  const [tempExchangeRate, setTempExchangeRate] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [preserveCurrencySelection, setPreserveCurrencySelection] = useState(false);
  const [isDisplayDataModified, setIsDisplayDataModified] = useState(false);
  const [search, setSearch] = useState("");
  const inputRefs = useRef({});
  const [inputFieldOrder, setInputFieldOrder] = useState([]);

  const columnsToHideForAgent = [
    "dipFOB", "cifLKR", "cm3", "generalDuty", "surcharge", "pPerUnitLKR", 
    "pPerCM3LKR", "pal", "ssl", "vat", "luxuryTax", "cifJPY1", "cifLKR1",
    "generalDutyRate", "surchargeRate", "vatRate", "luxTaxFD", 
    "luxuryTaxRateValue", "luxuryTaxCalculation"
  ];

  const currencyFlags = {
    JPY: "🇯🇵",
    USD: "🇺🇸",
    THB: "🇹🇭",
    AUD: "🇦🇺",
    INR: "🇮🇳"
  };

  const getInputFieldOrder = () => {
    const baseFields = [
      "hsCode", "vehicleType", "fuelType", "engineCC", "freight", 
      "insurance", "other", "cm3", "pPerUnitLKR", "pPerCM3LKR", 
      "pal", "ssl", "rateCurrency", "exchangeRate", "generalDutyRate", 
      "surchargeRate", "vatRate", "luxTaxFD", "luxuryTaxRateValue"
    ];
    
    if (role === "AGENT") {
      return baseFields.filter(field => !columnsToHideForAgent.includes(field));
    }
    
    return baseFields;
  };

  useEffect(() => {
    if (editingId || addingNew) {
      const order = getInputFieldOrder();
      const priceFields = Array.from(selectedPriceTypes).map(priceType => `priceValue_${priceType}`);
      setInputFieldOrder([...order, ...priceFields]);
    }
  }, [editingId, addingNew, selectedPriceTypes, role]);

  const handleKeyDown = (e, currentField) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      navigateToNextField(currentField);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateToPreviousField(currentField);
    }
  };

  const navigateToNextField = (currentField) => {
    const currentIndex = inputFieldOrder.indexOf(currentField);
    if (currentIndex !== -1 && currentIndex < inputFieldOrder.length - 1) {
      const nextField = inputFieldOrder[currentIndex + 1];
      focusField(nextField);
    }
  };

  const navigateToPreviousField = (currentField) => {
    const currentIndex = inputFieldOrder.indexOf(currentField);
    if (currentIndex > 0) {
      const prevField = inputFieldOrder[currentIndex - 1];
      focusField(prevField);
    }
  };

  const focusField = (fieldName) => {
    if (inputRefs.current[fieldName]) {
      inputRefs.current[fieldName].focus();
      inputRefs.current[fieldName].select();
    }
  };

  const setInputRef = (fieldName, element) => {
    inputRefs.current[fieldName] = element;
  };

  useEffect(() => {
    const sourceData = isDisplayDataModified ? displayData : data;
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      const filtered = sourceData.filter(vehicle => 
        vehicle.vehicleType.toLowerCase().includes(lowercasedSearch) ||
        (vehicle.hsCode && vehicle.hsCode.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(sourceData);
    }
  }, [data, displayData, search, isDisplayDataModified]);

  useEffect(() => {
    if (data.length > 0 && !preserveCurrencySelection) {
      const firstVehicle = data[0];
      if (firstVehicle && firstVehicle.exchangeRate) {
        setExchangeRates(prev => ({
          ...prev,
          [selectedCurrency]: firstVehicle.exchangeRate
        }));
      }
    }
  }, [data, selectedCurrency, preserveCurrencySelection]);

  useEffect(() => {
    setDisplayData([...data]);
    if (!preserveCurrencySelection) {
      setIsDisplayDataModified(false);
    }
  }, [data, preserveCurrencySelection]);

  useEffect(() => {
    if (data.length === 0 && !addingNew) return;
  }, [data, addingNew]);

  const getManufacturer = (vehicleType) => {
    if (!vehicleType || typeof vehicleType !== "string") return null;

    const upperVehicleType = vehicleType.toUpperCase();

    for (const [key, value] of Object.entries(manufacturers)) {
      if (upperVehicleType.startsWith(key)) return value;
    }

    for (const [key, value] of Object.entries(manufacturers)) {
      if (upperVehicleType.includes(key)) return value;
    }

    return null;
  };

  const formatNumber = (value, col) => {
    if (typeof value === "number" && !isNaN(value)) {
      const noRoundCols = [
        "exchangeRate",
        "vatRate",
        "generalDutyRate",
        "surchargeRate",
        "luxuryTaxRateValue",
      ];

      if (noRoundCols.includes(col)) {
        if (col === "exchangeRate") return value.toFixed(4);
        return value.toLocaleString("en-US");
      }

      return Math.round(value).toLocaleString("en-US");
    }
    return value;
  };

  const getRowStyle = (priceType, isEditing = false, isAdding = false) => {
    let baseStyle = {};
    
    if (priceType === "webValue") {
      baseStyle = {
        backgroundColor: "#e3f2fd",
      };
    } else {
      baseStyle = {
        backgroundColor: "#fffde7",
      };
    }

    if (isEditing) {
      return {
        ...baseStyle,
        backgroundColor: "#fff3cd",
        borderLeft: "4px solid #ffc107",
        boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)",
      };
    }

    if (isAdding) {
      return baseStyle;
    }

    return baseStyle;
  };

  const getCellStyle = (priceType, isEditing = false, isAdding = false) => {
    let baseStyle = {};
    
    if (priceType === "webValue") {
      baseStyle = {
        backgroundColor: "#e3f2fd",
        color: "#0c0faeff",
      };
    } else {
      baseStyle = {
        backgroundColor: "#fffde7",
        color: "#5b3617ff",
      };
    }

    if (isEditing) {
      return {
        ...baseStyle,
        backgroundColor: "#fff3cd",
        color: "#856404",
      };
    }

    if (isAdding) {
      return baseStyle;
    }

    return baseStyle;
  };

  const getPriceTypeIndicator = (priceType) => {
    if (priceType === "webValue") {
      return (
        <span
          className="price-type-indicator"
          style={{
            backgroundColor: "#2196f3",
            color: "white",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: "bold",
            marginBottom: "2px",
            display: "block"
          }}
        >
          WV
        </span>
      );
    } else {
      return (
        <span
          className="price-type-indicator"
          style={{
            backgroundColor: "#ffeb3b",
            color: "#333",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: "bold",
            marginBottom: "2px",
            display: "block"
          }}
        >
          YB
        </span>
      );
    }
  };

  const recalculateVehicle = (vehicle, newExchangeRate, newCurrency) => {
    const updatedPriceCalculations = vehicle.priceCalculations.map(priceCalc => {
      const priceValue = priceCalc.priceValue;
      
      const freight = vehicle.freight || 0;
      const insurance = vehicle.insurance || 0;
      const other = vehicle.other || 0;
      const cm3 = vehicle.cm3 || 0;
      const pUnit = vehicle.pPerUnitLKR || 0;
      const pPerCM3 = vehicle.pPerCM3LKR || 0;
      const generalDutyRate = vehicle.generalDutyRate || 0.2;
      const surchargeRate = vehicle.surchargeRate || 0.5;
      const vatRate = vehicle.vatRate || 0.18;
      const luxTaxFD = vehicle.luxTaxFD || 0;
      const luxuryRate = vehicle.luxuryTaxRateValue || 0;
      const pal = vehicle.pal || 0;
      const ssl = vehicle.ssl || 0;

      const dipFOB = (priceValue * 100 / 110) * 0.85;
      const cifJPY = dipFOB + freight + insurance + other;
      const cifLKR = cifJPY * newExchangeRate;
      const generalDuty = cifLKR * generalDutyRate;
      const surcharge = generalDuty * surchargeRate;
      const pCM3LKR = cm3 * pPerCM3;
      
      const vatBase = (cifLKR * 0.1) + cifLKR + generalDuty + surcharge + pUnit + pCM3LKR + pal + ssl;
      const vat = vatBase * vatRate;
      
      const cifJPY1 = dipFOB + freight + insurance;
      const cifLKR1 = cifJPY1 * newExchangeRate;
      const luxuryTaxCalculation = Math.max(0, cifLKR1 - luxTaxFD);
      const luxuryTax = luxuryTaxCalculation * luxuryRate;
      
      const totalTax = generalDuty + surcharge + pUnit + pCM3LKR + pal + ssl + vat + luxuryTax + 1750 + 15000;

      return {
        ...priceCalc,
        dipFOB: Math.round(dipFOB),
        cifJPY: Math.round(cifJPY),
        cifLKR: Math.round(cifLKR),
        generalDuty: Math.round(generalDuty),
        surcharge: Math.round(surcharge),
        pPerCM3LKR: Math.round(pCM3LKR),
        vat: Math.round(vat),
        luxuryTax: Math.round(luxuryTax),
        luxuryTaxCalculation: Math.round(luxuryTaxCalculation),
        tax: Math.round(totalTax),
        cifJPY1: Math.round(cifJPY1),
        cifLKR1: Math.round(cifLKR1),
      };
    });

    return {
      ...vehicle,
      exchangeRate: newExchangeRate,
      rateCurrency: newCurrency,
      priceCalculations: updatedPriceCalculations
    };
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    setPreserveCurrencySelection(true);
    const currentRate = exchangeRates[currency] || 1;
    setTempExchangeRate(currentRate.toString());
  };

  const formatColumnHeader = (col) => {
    if (col === "priceValue") {
      return (
        <div style={{ lineHeight: '1.1' }}>
          <div>YELLOW /</div>
          <div>WEB VALUE</div>
        </div>
      );
    }
    
    const label = col === "priceValue" ? "Price Value" : (columnLabels[col] || col);
    
    const longHeaders = {
      'generalDutyRate': 'Gen.\nDuty \nRate',
      'surchargeRate': 'Sur.\nRate',
      'luxuryTaxRateValue': 'Lux.\n Tax\nRate \nVal.',
      'luxuryTaxCalculation': 'Luxury Tax\nCalculation',
      'pPerUnitLKR': 'P Per Unit\nLKR',
      'pPerCM3LKR': 'P Per CM3\nLKR',
      'exchangeRate': 'Exchange\nRate',
      'rateCurrency': 'Currency',
      'vehicleType': 'Vehicle\nType',
      'fuelType': 'Fuel\nType',
      'engineCC': 'Engine\nCC',
      'vatRate': 'VAT\nRate'
    };

    if (longHeaders[col]) {
      return longHeaders[col].split('\n').map((line, index) => (
        <div key={index} style={{ lineHeight: '1.1' }}>{line}</div>
      ));
    }
    
    return label;
  };

  const handleExchangeRateChange = (e) => {
    setTempExchangeRate(e.target.value);
  };

  const handleApplyExchangeRate = async () => {
    const newRate = parseFloat(tempExchangeRate);
    if (isNaN(newRate) || newRate <= 0) {
      setError("Please enter a valid exchange rate.");
      return;
    }

    setError(role === "AGENT" ? "Updating display rates..." : "Updating exchange rates...");
    setPreserveCurrencySelection(true);

    try {
      if (role === "AGENT") {
        const updatedDisplayData = data.map(vehicle => 
          recalculateVehicle(vehicle, newRate, selectedCurrency)
        );
        
        setExchangeRates(prev => ({
          ...prev,
          [selectedCurrency]: newRate
        }));
        
        setDisplayData(updatedDisplayData);
        setIsDisplayDataModified(true);
        setError("");
        
      } else {
        const updatedDisplayData = data.map(vehicle => 
          recalculateVehicle(vehicle, newRate, selectedCurrency)
        );
        
        setExchangeRates(prev => ({
          ...prev,
          [selectedCurrency]: newRate
        }));
        
        setDisplayData(updatedDisplayData);
        setIsDisplayDataModified(true);
        setError("");
      }
    } catch (err) {
      console.error("Error updating exchange rates:", err);
      setError("Failed to update exchange rates. Please try again.");
    }
  };

  useEffect(() => {
    setTempExchangeRate(exchangeRates[selectedCurrency].toString());
  }, [selectedCurrency, exchangeRates]);

  useEffect(() => {
    setDisplayData([...data]);
    if (!preserveCurrencySelection) {
      setIsDisplayDataModified(false);
    }
  }, [data, preserveCurrencySelection]);

  useEffect(() => {
    if (data.length === 0 && !addingNew) return;
  }, [data, addingNew]);

  const handleAddNew = () => {
    const initialData = {
      hsCode: "",
      vehicleType: "",
      fuelType: "",
      engineCC: 0,
      freight: 0,
      insurance: 0,
      other: 0,
      cm3: 0,
      pPerUnitLKR: 0,
      pPerCM3LKR: 0,
      pal: 0,
      ssl: 0,
      rateCurrency: selectedCurrency,
      exchangeRate: exchangeRates[selectedCurrency],
      generalDutyRate: 0.2,
      surchargeRate: 0.5,
      vatRate: 0.18,
      luxTaxFD: 0,
      luxuryTaxRateValue: 0
    };
    
    setFormData(initialData);
    setSelectedPriceTypes(new Set(["yellowBook"]));
    setAddingNew(true);
    setEditingId(null);
    setError("");
    
    setTimeout(() => {
      focusField("hsCode");
    }, 100);
  };

  const handleEditStart = (vehicle) => {
    const priceCalculations = vehicle.priceCalculations || [];
    const availablePriceTypes = new Set();
    
    if (priceCalculations.length > 0) {
      priceCalculations.forEach(calc => {
        availablePriceTypes.add(calc.priceType);
      });
    } else {
      availablePriceTypes.add("yellowBook");
    }
    
    setSelectedPriceTypes(availablePriceTypes);
    setFormData(vehicle);
    setEditingId(vehicle._id);
    setAddingNew(false);
    setError("");
    
    setTimeout(() => {
      focusField("hsCode");
    }, 100);
  };

  const handlePriceTypeChange = (priceType) => {
    const newSelectedTypes = new Set(selectedPriceTypes);
    
    if (newSelectedTypes.has(priceType)) {
      if (newSelectedTypes.size === 1) {
        setError("At least one price type must be selected.");
        return;
      }
      newSelectedTypes.delete(priceType);
    } else {
      newSelectedTypes.add(priceType);
    }
    
    setSelectedPriceTypes(newSelectedTypes);
    setError("");
  };

  const getPriceValue = (priceType) => {
    if (!formData.priceCalculations) return 0;
    const priceCalc = formData.priceCalculations.find(pc => pc.priceType === priceType);
    return priceCalc ? priceCalc.priceValue : 0;
  };

  const handlePriceValueChange = (priceType, e) => {
    const value = Number(e.target.value) || 0;
    setFormData(prev => {
      const newPriceCalculations = [...(prev.priceCalculations || [])];
      const existingIndex = newPriceCalculations.findIndex(pc => pc.priceType === priceType);
      
      if (existingIndex >= 0) {
        newPriceCalculations[existingIndex] = {
          ...newPriceCalculations[existingIndex],
          priceValue: value
        };
      } else {
        newPriceCalculations.push({
          priceType: priceType,
          priceValue: value
        });
      }
      
      return {
        ...prev,
        priceCalculations: newPriceCalculations
      };
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setAddingNew(false);
    setFormData({});
    setSelectedPriceTypes(new Set(["yellowBook"]));
    setError("");
    inputRefs.current = {};
    setInputFieldOrder([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.hsCode || !formData.vehicleType || !formData.fuelType) {
      setError("HS Code, Vehicle Type, and Fuel Type are required.");
      return;
    }

    for (const priceType of selectedPriceTypes) {
      const priceValue = getPriceValue(priceType);
      if (priceValue === undefined || priceValue === null || priceValue < 0) {
        setError(`Price value for ${priceType === 'yellowBook' ? 'Yellow Book' : 'Web Value'} must be a valid number.`);
        return;
      }
    }

    const updatedPriceCalculations = [];
    selectedPriceTypes.forEach(priceType => {
      const priceValue = getPriceValue(priceType);
      updatedPriceCalculations.push({
        priceType: priceType,
        priceValue: priceValue
      });
    });

    try {
      if (addingNew) {
        await api.post("/vehicles", {
          ...formData,
          priceCalculations: updatedPriceCalculations
        });
        onRefresh();
        handleCancel();
      } else if (editingId) {
        await api.put(`/vehicles/${editingId}`, {
          ...formData,
          priceCalculations: updatedPriceCalculations
        });
        onRefresh();
        handleCancel();
      }
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError(err.response?.data?.message || "Failed to save vehicle.");
    }
  };

  const tableRows = [];
  
  if (addingNew && role === "ADMIN") {
    const sortedPriceTypes = Array.from(selectedPriceTypes).sort();
    sortedPriceTypes.forEach((priceType, index) => {
      tableRows.push({
        _id: `new_row_${priceType}`,
        isNew: true,
        priceType: priceType,
        ...formData,
        priceValue: getPriceValue(priceType),
        isMultiRow: sortedPriceTypes.length > 1,
        rowIndex: index,
        totalRows: sortedPriceTypes.length
      });
    });
  }

  filteredData.forEach((vehicle) => {
    const priceCalculations = vehicle.priceCalculations || [];
    
    const isBeingEdited = editingId === vehicle._id;
    
    if (isBeingEdited && role === "ADMIN") {
      const sortedPriceTypes = Array.from(selectedPriceTypes).sort();
      sortedPriceTypes.forEach((priceType, index) => {
        const row = {
          ...vehicle,
          _id: `${vehicle._id}_${index}`,
          originalId: vehicle._id,
          priceType: priceType,
          priceValue: getPriceValue(priceType),
          tax: priceCalculations.find(pc => pc.priceType === priceType)?.tax,
          dipFOB: priceCalculations.find(pc => pc.priceType === priceType)?.dipFOB,
          cifJPY: priceCalculations.find(pc => pc.priceType === priceType)?.cifJPY,
          cifLKR: priceCalculations.find(pc => pc.priceType === priceType)?.cifLKR,
          generalDuty: priceCalculations.find(pc => pc.priceType === priceType)?.generalDuty,
          surcharge: priceCalculations.find(pc => pc.priceType === priceType)?.surcharge,
          pPerCM3LKR: priceCalculations.find(pc => pc.priceType === priceType)?.pPerCM3LKR,
          vat: priceCalculations.find(pc => pc.priceType === priceType)?.vat,
          luxuryTax: priceCalculations.find(pc => pc.priceType === priceType)?.luxuryTax,
          luxuryTaxCalculation: priceCalculations.find(pc => pc.priceType === priceType)?.luxuryTaxCalculation,
          cifJPY1: priceCalculations.find(pc => pc.priceType === priceType)?.cifJPY1,
          cifLKR1: priceCalculations.find(pc => pc.priceType === priceType)?.cifLKR1,
          isMultiRow: sortedPriceTypes.length > 1,
          rowIndex: index,
          totalRows: sortedPriceTypes.length,
          isEditing: true
        };
        tableRows.push(row);
      });
    } else {
      if (priceCalculations.length === 0) {
        const legacyRow = {
          ...vehicle,
          priceType: vehicle.priceType || "yellowBook",
          priceValue: vehicle.yellowBookPrice || 0,
          isEditing: false
        };
        tableRows.push(legacyRow);
      } else {
        priceCalculations.forEach((priceCalc, index) => {
          const row = {
            ...vehicle, // Keep all original vehicle data
            _id: `${vehicle._id}_${index}`,
            originalId: vehicle._id,
            priceType: priceCalc.priceType,
            priceValue: priceCalc.priceValue,
            // Only override calculated fields, not input fields
            tax: priceCalc.tax,
            dipFOB: priceCalc.dipFOB,
            cifJPY: priceCalc.cifJPY,
            cifLKR: priceCalc.cifLKR,
            generalDuty: priceCalc.generalDuty,
            surcharge: priceCalc.surcharge,
            // Don't override pPerUnitLKR - keep the original from vehicle
            // pPerCM3LKR: priceCalc.pPerCM3LKR,  // ← Remove this line
            calculatedPPerCM3LKR: priceCalc.pPerCM3LKR, // Store calculated value separately if needed
            vat: priceCalc.vat,
            luxuryTax: priceCalc.luxuryTax,
            luxuryTaxCalculation: priceCalc.luxuryTaxCalculation,
            cifJPY1: priceCalc.cifJPY1,
            cifLKR1: priceCalc.cifLKR1,
            isMultiRow: priceCalculations.length > 1,
            rowIndex: index,
            totalRows: priceCalculations.length,
            isEditing: false
          };
          tableRows.push(row);
        });
      }
    }
  });

  let displayColumns = [
    "hsCode", "vehicleType", "fuelType", "engineCC", "tax", "priceValue",
    "dipFOB", "freight", "insurance", "other", "cifJPY", "cifLKR", "cm3",
    "generalDuty", "surcharge", "pPerUnitLKR", "pPerCM3LKR", "pal", "ssl",
    "vat", "luxuryTax", "rateCurrency", "exchangeRate",
    "generalDutyRate", "surchargeRate", "vatRate", "luxTaxFD", 
    "luxuryTaxRateValue", "luxuryTaxCalculation"
  ];

  if (role === "AGENT") {
    displayColumns = displayColumns.filter(col => !columnsToHideForAgent.includes(col));
  }

  const mergeableColumns = [
    "hsCode", "vehicleType", "fuelType", "engineCC", "freight", 
    "insurance", "other", "cm3", "pPerUnitLKR", "pPerCM3LKR", 
    "pal", "ssl", "rateCurrency", "exchangeRate",
    "generalDutyRate", "surchargeRate", "vatRate", "luxTaxFD", 
    "luxuryTaxRateValue"
  ];

  const editableFields = [
    "hsCode", "vehicleType", "fuelType", "engineCC", "freight", 
    "insurance", "other", "cm3", "pPerUnitLKR", "pPerCM3LKR", 
    "pal", "ssl", "rateCurrency", "exchangeRate", "generalDutyRate", 
    "surchargeRate", "vatRate", "luxTaxFD", "luxuryTaxRateValue"
  ];

  const numericFields = [
    "engineCC", "freight", "insurance", "other", "cm3",
    "pPerUnitLKR", "pPerCM3LKR", "pal", "ssl", "exchangeRate",
    "generalDutyRate", "surchargeRate", "vatRate", "luxTaxFD", "luxuryTaxRateValue"
  ];

  if (filteredData.length === 0 && !addingNew && !editingId) return <p>No vehicles found</p>;

  return (
    <div className="table-wrapper">
      <div className="legend" style={{
        marginBottom: "7px",
        padding: "10px 15px",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: "500",
        color: "white",
        borderRadius: "6px",
        flexWrap: "nowrap",
        gap: "20px",
        overflowX: "auto"
      }}>
        {/* Combined Price Indicators and Exchange Controls */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "20px",
          flexShrink: 0
        }}>
          {/* Price Indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              <span
                style={{
                  backgroundColor: "#fff176",
                  color: "#000",
                  fontSize: "14px",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  fontWeight: "bold",
                }}
              >
                YB
              </span>
              = Yellow Book Price
            </span>

            <span style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              <span
                style={{
                  backgroundColor: "#64b5f6",
                  color: "#fff",
                  fontSize: "14px",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  fontWeight: "bold",
                }}
              >
                WV
              </span>
              = Web Value
            </span>
          </div>

          {/* Exchange Controls */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            flexShrink: 0,
            paddingLeft: "40px"
          }}>
            {/* Currency Selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>Currency:</span>
              <div style={{ display: "flex", gap: "5px", flexWrap: "nowrap" }}>
                {Object.keys(exchangeRates).map(currency => (
                  <label key={currency} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "3px",
                    cursor: "pointer",
                    fontSize: "13px",
                    whiteSpace: "nowrap"
                  }}>
                    <input
                      type="radio"
                      name="currency"
                      value={currency}
                      checked={selectedCurrency === currency}
                      onChange={() => handleCurrencyChange(currency)}
                      style={{ margin: 0, width: "12px", height: "12px" }}
                    />
                    <span style={{ fontWeight: "600" }}>{currency}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Exchange Rate Input and Button */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              flexShrink: 0,
              paddingRight: "30px",
            }}>
              <label style={{ fontWeight: "600", whiteSpace: "nowrap", color: "red" }}>
                {selectedCurrency} Rate:
              </label>
              <input
                type="number"
                value={tempExchangeRate}
                onChange={handleExchangeRateChange}
                placeholder="Enter exchange rate"
                style={{
                  padding: "6px 8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  width: "100px",
                  fontSize: "13px"
                }}
                step="0.0001"
                min="0"
              />
              <button
                onClick={handleApplyExchangeRate}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                Apply
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ 
              flexShrink: 0,
              minWidth: "200px"
            }}>
              <SearchBar 
                search={search} 
                setSearch={setSearch} 
                placeholder="Search by Vehicle or HS" 
              />
            </div>
          </div>
        </div>

        {/* Right section - Role indicator and Add Vehicle button */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "15px",
          flexShrink: 0
        }}>
          {/* Role indicator for agents */}
          {role === "AGENT" && (
            <span style={{ 
              fontSize: "12px", 
              backgroundColor: "#17a2b8", 
              color: "white", 
              padding: "2px 6px", 
              borderRadius: "3px",
              fontWeight: "bold",
              whiteSpace: "nowrap"
            }}>
              AGENT VIEW
            </span>
          )}

          {/* Add Vehicle Button - Only for ADMIN */}
          {role === "ADMIN" && !addingNew && !editingId && (
            <button
              className="add-vehicle-btn"
              onClick={handleAddNew}
              style={{
                background: "#27ae60",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginRight: "1400px"
              }}
            >
              + Add Vehicle
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          color: error.includes("Updating") ? "#17a2b8" : "#e74c3c", 
          padding: "10px", 
          marginBottom: "15px", 
          backgroundColor: error.includes("Updating") ? "#d1ecf1" : "#fadbd8",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      <div className="table-container" style={{
        maxHeight: "70vh",
        overflowY: "auto",
        overflowX: role === "AGENT" ? "hidden" : "auto",
        border: "1px solid #ddd",
        borderRadius: "6px"
      }}>
        <table className="vehicles-table" style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
          lineHeight: "1.2",
          tableLayout: role === "AGENT" ? "auto" : "fixed"
        }}>
          <thead style={{
            position: "sticky",
            top: 0,
            backgroundColor: "#f8f9fa",
            zIndex: 10,
            borderBottom: "2px solid #dee2e6"
          }}>
            <tr>
              <th style={{
                padding: "4px 4px",
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                width: role === "AGENT" ? "100px" : "130px",
                position: "sticky",
                top: 0,
                zIndex: 11,
                fontSize: "11px",
                lineHeight: "1.1",
                height: "35px"
              }}>
                {formatColumnHeader("gradeCheck")}
              </th>
              {displayColumns.map((col) => (
                <th key={col} style={{
                  padding: "6px 4px",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  minWidth: role === "AGENT" ? "80px" : "100px",
                  position: "sticky",
                  top: 0,
                  zIndex: 11,
                  whiteSpace: col === 'priceValue' ? 'normal' : 'nowrap',
                  fontSize: "11px",
                  lineHeight: "1.1",
                  height: col === 'priceValue' ? '45px' : '35px'
                }}>
                  {formatColumnHeader(col)}
                </th>
              ))}
              {role === "ADMIN" && (
                <th style={{
                  padding: "6px 4px",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  minWidth: "120px",
                  position: "sticky",
                  top: 0,
                  zIndex: 11,
                  fontSize: "11px",
                  lineHeight: "1.1",
                  height: "35px"
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              const isEditing = row.isEditing;
              const isNewRow = row.isNew;
              const manufacturer = getManufacturer(row.vehicleType);
              const cellStyle = getCellStyle(row.priceType, isEditing, isNewRow);
              const originalVehicle = data.find(v => v._id === (row.originalId || row._id));

              return (
                <tr 
                  key={row._id} 
                  style={getRowStyle(row.priceType, isEditing, isNewRow)}
                  className={`${row.isMultiRow ? 'multi-row-vehicle' : ''} ${isEditing ? 'editing-row' : ''}`}
                >
                  {(!row.isMultiRow || row.rowIndex === 0) && (
                    <td 
                      className="manufacturer-cell" 
                      style={{
                        ...(isNewRow || isEditing ? 
                          (row.priceType === "webValue" ? 
                            { backgroundColor: "#e3f2fd", color: "#0c0faeff" } : 
                            { backgroundColor: "#fffde7", color: "#5b3617ff" }
                          ) : cellStyle),
                        verticalAlign: "middle",
                        padding: "3px 4px",
                        textAlign: "center",
                        border: "1px solid #dee2e6",
                        height: "28px",
                      }}
                      {...(row.isMultiRow ? { rowSpan: row.totalRows } : {})}
                    >
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center",
                        gap: "2px"
                      }}>
                        {manufacturer ? (
                          <a
                            href={manufacturer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="manufacturer-link"
                            title={`Visit ${manufacturer.name} official website`}
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              textDecoration: "none"
                            }}
                          >
                            <img
                              src={manufacturer.logo}
                              alt={manufacturer.name}
                              className="manufacturer-logo"
                              style={{ width: "24px", height: "24px", objectFit: "contain" }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "inline";
                              }}
                            />
                            <span
                              className="manufacturer-name"
                              style={{ display: "none", fontSize: "10px", textAlign: "center" }}
                            >
                              {manufacturer.name}
                            </span>
                          </a>
                        ) : (
                          <span className="unknown-manufacturer" style={{ 
                            fontSize: "9px", 
                            textAlign: "center",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            Unknown
                          </span>
                        )}
                        
                        <span style={{ fontSize: "16px" }}>{currencyFlags[selectedCurrency]}</span>
                        
                        {row.isMultiRow ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px" }}>
                            {tableRows
                              .filter(r => (r.originalId === (row.originalId || row._id)) || (r._id === row._id && !r.originalId))
                              .map((vehicleRow, idx) => (
                                <span key={`${vehicleRow.priceType}_${idx}`}>
                                  {getPriceTypeIndicator(vehicleRow.priceType)}
                                </span>
                              ))
                            }
                          </div>
                        ) : (
                          getPriceTypeIndicator(row.priceType)
                        )}
                      </div>
                    </td>
                  )}

                  {displayColumns
                    .filter((col) => {
                      if (row.isMultiRow && row.rowIndex > 0 && mergeableColumns.includes(col)) {
                        return false;
                      }
                      return true;
                    })
                    .map((col) => {
                    const shouldMerge = row.isMultiRow && mergeableColumns.includes(col);
                    
                    let columnCellStyle;
                    if (shouldMerge) {
                      columnCellStyle = {
                        backgroundColor: "#fffde7",
                        color: "#5b3617ff",
                      };
                    } else {
                      columnCellStyle = getCellStyle(row.priceType, isEditing, isNewRow);
                    }

                    const cellProps = shouldMerge && row.rowIndex === 0 ? { rowSpan: row.totalRows } : {};
                    const mergedCellStyle = shouldMerge ? {
                      ...columnCellStyle,
                      verticalAlign: "middle",
                      padding: "3px 4px",
                      border: "1px solid #dee2e6",
                      height: "28px",
                      borderBottom: row.rowIndex === 0 && row.totalRows > 1 ? "1px solid #ddd" : columnCellStyle.borderBottom
                    } : {
                      ...columnCellStyle,
                      padding: "3px 4px",
                      border: "1px solid #dee2e6",
                      height: "28px"
                    };

                    if (col === "vehicleType") {
                      return (
                        <td key={col} style={mergedCellStyle} {...cellProps}>
                          {(isEditing || isNewRow) ? (
                            <input
                              ref={(el) => setInputRef("vehicleType", el)}
                              type="text"
                              name="vehicleType"
                              value={formData.vehicleType || ""}
                              onChange={handleChange}
                              onKeyDown={(e) => handleKeyDown(e, "vehicleType")}
                              className="edit-input"
                              placeholder="Enter vehicle type"
                              style={{
                                width: "100%",
                                padding: "4px",
                                border: "1px solid #ccc",
                                borderRadius: "3px",
                                fontSize: "12px"
                              }}
                            />
                          ) : (
                            manufacturer ? (
                              <a
                                href={manufacturer.lineup}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none", color: "inherit" }}
                                title={`View ${manufacturer.name} Line-Up`}
                              >
                                {row.vehicleType}
                              </a>
                            ) : (
                              row.vehicleType || "-"
                            )
                          )}
                        </td>
                      );
                    }

                    if (col === "priceValue") {
                      return (
                        <td key={col} style={{
                          ...getCellStyle(row.priceType, isEditing, isNewRow),
                          padding: "3px 4px",
                          border: "1px solid #dee2e6",
                          height: "28px"
                        }}>
                          {(isEditing || isNewRow) ? (
                            <div className="price-value-edit-container">
                              {(!row.isMultiRow || row.rowIndex === 0) && (
                                <div className="price-type-selection" style={{ marginBottom: "4px" }}>
                                  <div className="price-type-checkboxes" style={{
                                    display: "flex",
                                    gap: "6px",
                                    justifyContent: "center",
                                    flexWrap: "wrap"
                                  }}>
                                    <label className="checkbox-label" style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "2px",
                                      fontSize: "10px",
                                      cursor: "pointer"
                                    }}>
                                      <input
                                        type="checkbox"
                                        checked={selectedPriceTypes.has("yellowBook")}
                                        onChange={() => handlePriceTypeChange("yellowBook")}
                                        style={{ width: "10px", height: "10px" }}
                                      />
                                      <span className="checkbox-text">YB</span>
                                    </label>
                                    <label className="checkbox-label" style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "2px",
                                      fontSize: "10px",
                                      cursor: "pointer"
                                    }}>
                                      <input
                                        type="checkbox"
                                        checked={selectedPriceTypes.has("webValue")}
                                        onChange={() => handlePriceTypeChange("webValue")}
                                        style={{ width: "10px", height: "10px" }}
                                      />
                                      <span className="checkbox-text">WV</span>
                                    </label>
                                  </div>
                                </div>
                              )}
                              
                              <input
                                ref={(el) => setInputRef(`priceValue_${row.priceType}`, el)}
                                type="number"
                                value={getPriceValue(row.priceType)}
                                onChange={(e) => handlePriceValueChange(row.priceType, e)}
                                onKeyDown={(e) => handleKeyDown(e, `priceValue_${row.priceType}`)}
                                placeholder={`${row.priceType === "yellowBook" ? "Yellow Book" : "Web Value"} price`}
                                className="price-input"
                                min="0"
                                step="1000"
                                style={{
                                  width: "100%",
                                  padding: "2px 4px",
                                  border: "1px solid #ccc",
                                  borderRadius: "2px",
                                  fontSize: "11px",
                                  height: "22px"
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>{formatNumber(row.priceValue, col)}</span>
                            </div>
                          )}
                        </td>
                      );
                    }

                    if (col === "rateCurrency") {
                      return (
                        <td key={col} style={mergedCellStyle} {...cellProps}>
                          {(isEditing || isNewRow) && editableFields.includes(col) ? (
                            <select
                              ref={(el) => setInputRef("rateCurrency", el)}
                              name="rateCurrency"
                              value={formData.rateCurrency || selectedCurrency}
                              onChange={handleChange}
                              onKeyDown={(e) => handleKeyDown(e, "rateCurrency")}
                              className="edit-input"
                              style={{
                                width: "100%",
                                padding: "2px 4px",
                                border: "1px solid #ccc",
                                borderRadius: "2px",
                                fontSize: "11px",
                                height: "22px"
                              }}
                            >
                              {Object.keys(exchangeRates).map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                              ))}
                            </select>
                          ) : (
                            isDisplayDataModified ? selectedCurrency : (row[col] || selectedCurrency)
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={col} style={mergedCellStyle} {...cellProps}>
                        {(isEditing || isNewRow) && editableFields.includes(col) ? (
                          numericFields.includes(col) ? (
                            <input
                              ref={(el) => setInputRef(col, el)}
                              type="number"
                              name={col}
                              value={formData[col] || 0}
                              onChange={handleNumericChange}
                              onKeyDown={(e) => handleKeyDown(e, col)}
                              className="edit-input numeric-input"
                              step={col === "exchangeRate" ? "0.0001" : "0.01"}
                              placeholder={`Enter ${col}`}
                              style={{
                                width: "100%",
                                padding: "2px 4px",
                                border: "1px solid #ccc",
                                borderRadius: "2px",
                                fontSize: "11px",
                                height: "22px"
                              }}
                            />
                          ) : (
                            <input
                              ref={(el) => setInputRef(col, el)}
                              type="text"
                              name={col}
                              value={formData[col] || ""}
                              onChange={handleChange}
                              onKeyDown={(e) => handleKeyDown(e, col)}
                              className="edit-input"
                              placeholder={`Enter ${col}`}
                              style={{
                                width: "100%",
                                padding: "2px 4px",
                                border: "1px solid #ccc",
                                borderRadius: "2px",
                                fontSize: "11px",
                                height: "22px"
                              }}
                            />
                          )
                        ) : (
                          formatNumber(row[col], col) || "-"
                        )}
                      </td>
                    );
                  })}

                  {role === "ADMIN" && (() => {
                    if (row.isMultiRow && row.rowIndex > 0) {
                      return null;
                    }

                    const actionCellProps = row.isMultiRow ? { rowSpan: row.totalRows } : {};
                    
                    return (
                      <td 
                        className="actions-cell" 
                        style={{
                          ...(isNewRow || isEditing ? 
                            (row.priceType === "webValue" ? 
                              { backgroundColor: "#e3f2fd", color: "#0c0faeff" } : 
                              { backgroundColor: "#fffde7", color: "#5b3617ff" }
                            ) : cellStyle),
                          verticalAlign: "middle",
                          textAlign: "center",
                          padding: "8px",
                          border: "1px solid #dee2e6"
                        }}
                        {...actionCellProps}
                      >
                        {isEditing || isNewRow ? (
                          <div className="action-buttons editing" style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "6px",
                            justifyContent: "center",
                            alignItems: "center"
                          }}>
                            <button
                              className="save-btn"
                              onClick={handleSubmit}
                              type="button"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={handleCancel}
                              type="button"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons" style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "6px",
                            justifyContent: "center",
                            alignItems: "center"
                          }}>
                            <button
                              className="edit-btn"
                              onClick={() => handleEditStart(originalVehicle)}
                              type="button"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => onDelete(row.originalId || row._id)}
                              type="button"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })()}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;