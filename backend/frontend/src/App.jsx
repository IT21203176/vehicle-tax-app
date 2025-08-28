import { NavLink, useNavigate } from "react-router-dom";
import "./Navigation.css"; // optional if you want custom styles

const Navigation = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token"); // Check login status
  const userRole = localStorage.getItem("role"); // e.g., 'admin' or 'user'

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <h1
            onClick={() => navigate("/vehicles")}
            className="text-xl text-white font-bold cursor-pointer"
          >
            Vehicle Tax System
          </h1>

          {/* Navigation Links */}
          <div className="flex gap-6">
            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Vehicles
            </NavLink>

            <NavLink
              to="/exchange-rates"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
                }`
              }
            >
              Exchange Rates
            </NavLink>

            {/* Admin-only link */}
            {userRole === "admin" && (
              <NavLink
                to="/register-agent"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                Register Agent
              </NavLink>
            )}
          </div>

          {/* Auth Button */}
          <div>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm ${
                    isActive ? "bg-green-700" : "text-white"
                  }`
                }
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
