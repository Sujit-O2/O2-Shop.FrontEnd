import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  FaUser, FaEnvelope, FaIdBadge, FaSignOutAlt, 
  FaEdit, FaBoxOpen, FaShoppingBag, FaStore 
} from "react-icons/fa";
import "./css/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
        withCredentials: true,
      });
      setProfile(response.data);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch profile";
      setError(message);
    } finally {
      // Small artificial delay to show off the skeleton animation smoothly
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setProfile(null);
    localStorage.clear();
    // Force cleanup of cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/login";
  };

  // Skeleton Loader Component
  const ProfileSkeleton = () => (
    <div className="profile-card skeleton-wrapper">
      <div className="skeleton-banner"></div>
      <div className="skeleton-avatar"></div>
      <div className="skeleton-line title"></div>
      <div className="skeleton-line subtitle"></div>
      <div className="skeleton-grid">
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
      </div>
    </div>
  );

  if (loading) return <div className="profile-page"><ProfileSkeleton /></div>;

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-card">
          <h3>⚠️ Oops!</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  const isSeller = profile?.role === "SELLER";
  
  // Image handling
  const base64 = profile?.profileImageBase64?.trim();
  const imgSrc = base64
    ? `data:image/${base64.startsWith("/") ? "png" : "jpeg"};base64,${base64}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Fallback placeholder

  // Dynamic Theme Colors based on Role
  const themeColor = isSeller ? "var(--purple)" : "var(--primary)";

  return (
    <div className="profile-page">
      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* --- Header Section --- */}
        <div className="profile-header" style={{ background: `linear-gradient(135deg, ${themeColor}, #1e293b)` }}>
          <div className="header-content">
            <h2 className="profile-role">
              {isSeller ? <><FaStore /> Seller Account</> : <><FaUser /> User Account</>}
            </h2>
          </div>
        </div>

        {/* --- Avatar Section --- */}
        <div className="avatar-section">
          <motion.div 
            className="avatar-container"
            whileHover={{ scale: 1.05 }}
          >
            <img src={imgSrc} alt="Profile" className="avatar-img" />
            <button className="edit-icon" onClick={() => navigate("/update")}>
              <FaEdit />
            </button>
          </motion.div>
          <h2 className="user-name">{profile?.name || "User"}</h2>
          <span className={`status-badge ${isSeller ? "seller" : "user"}`}>
            {profile?.role}
          </span>
        </div>

        {/* --- Info Grid --- */}
        <div className="info-grid">
          <div className="info-item">
            <div className="icon-box"><FaEnvelope /></div>
            <div>
              <label>Email Address</label>
              <p>{profile?.email}</p>
            </div>
          </div>
          <div className="info-item">
            <div className="icon-box"><FaIdBadge /></div>
            <div>
              <label>User ID</label>
              <p className="mono-font">{profile?.id}</p>
            </div>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="action-section">
          <h4>Dashboard Actions</h4>
          <div className="buttons-grid">
            {/* User Actions */}
            {!isSeller && (
              <>
                <motion.button whileHover={{ scale: 1.02 }} className="action-btn" onClick={() => navigate("/orders")}>
                  <FaBoxOpen /> My Orders
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} className="action-btn" onClick={() => navigate("/cart")}>
                  <FaShoppingBag /> View Cart
                </motion.button>
              </>
            )}

            {/* Seller Actions */}
            {isSeller && (
              <motion.button whileHover={{ scale: 1.02 }} className="action-btn seller-btn" onClick={() => navigate("/manage-orders")}>
                <FaBoxOpen /> Manage Orders
              </motion.button>
            )}
          </div>
        </div>

        {/* --- Footer / Logout --- */}
        <div className="profile-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}