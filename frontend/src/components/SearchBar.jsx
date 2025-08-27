import React from "react";

const SearchBar = ({ search, setSearch, placeholder }) => {
  // Handler for search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value); 
  };

  return (
    <div className="search-container" style={{ 
      display: "flex", 
      justifyContent: "center",
    }}>
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          maxWidth: "800px",
          padding: "10px 15px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      />
    </div>
  );
};

export default SearchBar;