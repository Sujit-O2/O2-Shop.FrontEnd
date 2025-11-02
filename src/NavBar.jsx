import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/NavBar.css";
import logo from "./assets/O2.png";

export default function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide navbar on scroll down
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
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
        console.log("Not logged in or cookie missing");
      }
    };
    fetchProfile();
  }, []);

  // ✅ Clean logout: calls backend + removes cookies client-side
  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // Remove all cookies from client (in case browser keeps them)
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    });

    // Clear user state
    setUser(null);
    setRole(null);
    localStorage.clear();

    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/search/${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className={`navbar ${isVisible ? "navbar-show" : "navbar-hide"}`}>
      <div className="navbar-left">
        <Link
          to={role === "SELLER" ? "/seller/dashboard" : "/dashboard"}
          className="logo-link"
        >
          <img src={logo} alt="O2 Shop Logo" className="logo-img" />
          <span className="logo-text">O2 Shop</span>
        </Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="navbar-right">
        {user ? (
          <>
            {role === "USER" && (
              <>
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/orders" className="nav-item">Orders</Link>
                <Link to="/cart" className="nav-item cart-btn">🛒 Cart</Link>
              </>
            )}

            {role === "SELLER" && (
              <>
                <Link to="/seller/dashboard" className="nav-item">Seller Dashboard</Link>
                <Link to="/seller/orders" className="nav-item">Manage Orders</Link>
              </>
            )}

            <div className="profile-container">
              <button className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
                👤 {user.name || user.email.split("@")[0]}
              </button>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setShowMenu(false)}>My Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="nav-item login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
