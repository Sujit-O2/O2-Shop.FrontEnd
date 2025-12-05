import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaShoppingCart, FaUserCircle, FaSignOutAlt, FaUser, FaBoxOpen } from "react-icons/fa";
import "./css/NavBar.css";
import logo from "./assets/O2.png";

export default function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef(null);

  // Hide navbar on scroll down
  const handleScroll = () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Fetch user on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
          withCredentials: true,
        });
        setUser(res.data);
        setRole(res.data.role);
      } catch {
        console.log("No active session");
        navigate("/");
        // Silent fail (user not logged in)
      }
    };
    fetchProfile();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    });

    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${isVisible ? "navbar-visible" : "navbar-hidden"}`}>
      <div className="nav-container">
        {/* Logo Section */}
        <div className="nav-left">
          <Link
            to={role === "SELLER" ? "/seller/dashboard" : "/dashboard"}
            className="logo-link"
          >
            <img src={logo} alt="O2 Shop" className="logo-img" />
            <span className="logo-text">O2 Shop</span>
          </Link>
        </div>

        {/* Actions Section */}
        <div className="nav-right">
          {user ? (
            <>
              {role === "USER" && (
                <div className="nav-links">
                  <Link to="/orders" className="nav-item" title="Orders">
                    <FaBoxOpen className="nav-icon" />
                    <span className="nav-label">Orders</span>
                  </Link>
                  <Link to="/cart" className="nav-item cart-btn" title="Cart">
                    <FaShoppingCart className="nav-icon" />
                    <span className="nav-label">Cart</span>
                  </Link>
                </div>
              )}

              {role === "SELLER" && (
                <div className="nav-links">
                  <Link to="/seller/dashboard" className="nav-item">Dashboard</Link>
                  <Link to="/seller/orders" className="nav-item">Orders</Link>
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="profile-container" ref={dropdownRef}>
                <button 
                  className={`profile-btn ${showMenu ? 'active' : ''}`} 
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <FaUserCircle className="user-avatar" />
                  <span className="user-name">{user?.name?.split(" ")[0] || "User"}</span>
                </button>
                
                {showMenu && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <p>Signed in as</p>
                        <strong>{user?.email}</strong>
                    </div>
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="dropdown-item">
                       <FaUser className="dd-icon" /> Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                       <FaSignOutAlt className="dd-icon" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}