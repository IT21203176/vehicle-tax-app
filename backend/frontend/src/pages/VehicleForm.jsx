// frontend\src\pages\VehicleForm.jsx
import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa"; // Icons

const VehicleForm = ({ vehicle, onClose, onSaved }) => {
  const isEdit = Boolean(vehicle);

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
    rateCurrency: "",
    exchangeRate: 1,
    generalDutyRate: 0.2,
    surchargeRate: 0.5,
    vatRate: 0.18,
    luxTaxFD: 0,
    luxuryTaxRateValue: 0,
    priceCalculations: [
      { priceType: "yellowBook", priceValue: 0 }
    ]
  };

  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState("");
  const [frozenFields, setFrozenFields] = useState({});
  const [selectedPriceTypes, setSelectedPriceTypes] = useState({
    yellowBook: true,
    webValue: false
  });

  useEffect(() => {
    if (vehicle) {
      // Handle backward compatibility
      const priceCalculations = vehicle.priceCalculations || [];
      
      // If no priceCalculations but has old yellowBookPrice, convert it
      if (priceCalculations.length === 0 && vehicle.yellowBookPrice) {
        priceCalculations.push({
          priceType: vehicle.priceType || "yellowBook",
          priceValue: vehicle.yellowBookPrice
        });
      }

      // Set selected price types
      const priceTypes = {
        yellowBook: false,
        webValue: false
      };
      
      priceCalculations.forEach(calc => {
        if (calc.priceType === "yellowBook") priceTypes.yellowBook = true;
        if (calc.priceType === "webValue") priceTypes.webValue = true;
      });
      
      setSelectedPriceTypes(priceTypes);
      
      setFormData({
        ...initialData,
        ...vehicle,
        priceCalculations: priceCalculations.length > 0 ? priceCalculations : [{ priceType: "yellowBook", priceValue: 0 }]
      });

      const initialFrozen = {};
      Object.keys(initialData).forEach((key) => {
        if (numericFields.includes(key)) initialFrozen[key] = false;
      });
      setFrozenFields(initialFrozen);
    }
  }, [vehicle]);

  const numericFields = [
    "engineCC", "freight", "insurance", "other", "cm3",
    "pPerUnitLKR", "pPerCM3LKR", "pal", "ssl", "exchangeRate",
    "generalDutyRate", "surchargeRate", "vatRate", "luxTaxFD", "luxuryTaxRateValue"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handlePriceTypeChange = (priceType) => {
    setSelectedPriceTypes(prev => ({
      ...prev,
      [priceType]: !prev[priceType]
    }));
  };

  const handlePriceValueChange = (priceType, value) => {
    setFormData(prev => {
      const newPriceCalculations = [...prev.priceCalculations];
      const existingIndex = newPriceCalculations.findIndex(pc => pc.priceType === priceType);
      
      if (existingIndex >= 0) {
        newPriceCalculations[existingIndex] = {
          ...newPriceCalculations[existingIndex],
          priceValue: Number(value) || 0
        };
      } else {
        newPriceCalculations.push({
          priceType,
          priceValue: Number(value) || 0
        });
      }
      
      return {
        ...prev,
        priceCalculations: newPriceCalculations
      };
    });
  };

  const getPriceValue = (priceType) => {
    const priceCalc = formData.priceCalculations.find(pc => pc.priceType === priceType);
    return priceCalc ? priceCalc.priceValue : 0;
  };

  const handleBlur = (field) => {
    if (numericFields.includes(field)) {
      setFrozenFields((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleEditClick = (field) => {
    setFrozenFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.hsCode || !formData.vehicleType || !formData.fuelType) {
      setError("HS Code, Vehicle Type, and Fuel Type are required.");
      return;
    }

    // Filter price calculations to only include selected types
    const filteredPriceCalculations = formData.priceCalculations.filter(
      pc => selectedPriceTypes[pc.priceType]
    );

    if (filteredPriceCalculations.length === 0) {
      setError("At least one price type must be selected.");
      return;
    }

    // Validate price calculations
    for (let i = 0; i < filteredPriceCalculations.length; i++) {
      const calc = filteredPriceCalculations[i];
      if (!calc.priceValue || calc.priceValue <= 0) {
        setError(`Price value for ${calc.priceType} must be greater than 0.`);
        return;
      }
    }

    try {
      const url = isEdit ? `/vehicles/${vehicle._id}` : "/vehicles";
      const method = isEdit ? "PUT" : "POST";

      const response = await api({ method, url, data: {
        ...formData,
        priceCalculations: filteredPriceCalculations
      } });

      onSaved(response.data);
      onClose();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError(err.response?.data?.message || "Failed to save vehicle.");
    }
  };

  const fieldLabels = {
    hsCode: "HS Code",
    vehicleType: "Vehicle Type",
    fuelType: "Fuel Type",
    engineCC: "Engine CC",
    freight: "Freight",
    insurance: "Insurance",
    other: "Other",
    cm3: "CM3",
    pPerUnitLKR: "P per Unit LKR",
    pPerCM3LKR: "P per CM3 LKR",
    pal: "PAL",
    ssl: "SSL",
    rateCurrency: "Currency",
    exchangeRate: "Exchange Rate",
    generalDutyRate: "General Duty Rate",
    surchargeRate: "Surcharge Rate",
    vatRate: "VAT Rate",
    luxTaxFD: "Luxury Tax FD",
    luxuryTaxRateValue: "Luxury Tax Rate Value",
  };

  const commonFields = Object.keys(fieldLabels);

  const numericInputStyle = {
    color: "white",
    backgroundColor: "#333",
    MozAppearance: "textfield",
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: "600px" }}>
        <h2 style={{ color: "#3498db" }}>
          {isEdit ? "Edit Vehicle" : "Add Vehicle"}
        </h2>

        {error && <p className="error" style={{ color: "#e74c3c", marginBottom: "15px" }}>{error}</p>}

        <form onSubmit={handleSubmit} className="vehicle-form">
          
          {/* Price Calculations Section */}
          <div style={{ 
            marginBottom: "25px", 
            padding: "20px", 
            border: "2px solid #3498db", 
            borderRadius: "8px",
            backgroundColor: "#f8f9fa"
          }}>
            <h3 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>Price Calculations</h3>

            <div style={{ 
              display: "flex", 
              gap: "15px", 
              marginBottom: "15px",
              flexWrap: "wrap"
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedPriceTypes.yellowBook}
                  onChange={() => handlePriceTypeChange("yellowBook")}
                  style={{ width: "16px", height: "16px" }}
                />
                Yellow Book Price
              </label>
              
              <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedPriceTypes.webValue}
                  onChange={() => handlePriceTypeChange("webValue")}
                  style={{ width: "16px", height: "16px" }}
                />
                Web Value
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {selectedPriceTypes.yellowBook && (
                <div style={{ 
                  padding: "15px", 
                  backgroundColor: "white", 
                  borderRadius: "6px",
                  border: "1px solid #ddd"
                }}>
                  <h4 style={{ color: "#34495e", margin: "0 0 10px 0" }}>
                    Yellow Book Price
                  </h4>
                  
                  <input
                    type="number"
                    value={getPriceValue("yellowBook")}
                    onChange={(e) => handlePriceValueChange("yellowBook", e.target.value)}
                    placeholder="Enter Yellow Book price value"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      ...numericInputStyle
                    }}
                    required
                  />
                </div>
              )}

              {selectedPriceTypes.webValue && (
                <div style={{ 
                  padding: "15px", 
                  backgroundColor: "white", 
                  borderRadius: "6px",
                  border: "1px solid #ddd"
                }}>
                  <h4 style={{ color: "#34495e", margin: "0 0 10px 0" }}>
                    Web Value
                  </h4>
                  
                  <input
                    type="number"
                    value={getPriceValue("webValue")}
                    onChange={(e) => handlePriceValueChange("webValue", e.target.value)}
                    placeholder="Enter Web Value price value"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      ...numericInputStyle
                    }}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Common Fields */}
          {commonFields.map((field) => (
            <div className="form-group" key={field} style={{ position: "relative", marginBottom: "15px" }}>
              {numericFields.includes(field) ? (
                <>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                    {fieldLabels[field]}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    onBlur={() => handleBlur(field)}
                    readOnly={frozenFields[field]}
                    style={numericInputStyle}
                  />
                  {frozenFields[field] && (
                    <FaEdit
                      onClick={() => handleEditClick(field)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "70%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#f1c40f",
                      }}
                      title="Edit value"
                    />
                  )}
                </>
              ) : (
                <>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                    {fieldLabels[field]}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    style={{ 
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      color: "white", 
                      backgroundColor: "#333" 
                    }}
                  />
                </>
              )}
            </div>
          ))}

          <div className="form-actions" style={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: "10px", 
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid #eee"
          }}>
            <button 
              type="submit"
              style={{
                background: "#27ae60",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {isEdit ? "Update" : "Add"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: "#95a5a6",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          input[type=number]::-webkit-outer-spin-button,
          input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
    </div>
  );
};

export default VehicleForm;