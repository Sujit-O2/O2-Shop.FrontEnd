import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./css/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
        withCredentials: true,
      });
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Failed to fetch profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      // ✅ Call backend logout to clear cookies
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // ✅ Manually clear all cookies (browser may still hold them)
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    });

    // ✅ Clear local storage just in case
    localStorage.clear();

    // ✅ Redirect to login
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="status muted">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="status error">
          <p>Error: {error}</p>
          <div className="actions">
            <button className="btn-outlined" onClick={fetchProfile}>
              Retry
            </button>
            <Link className="link" to="/login">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSeller = profile?.role === "SELLER";
  const isUser = profile?.role === "USER";

  const base64 = profile?.profileImageBase64?.trim();
  const imgSrc = base64
    ? `data:image/${base64.startsWith("/") ? "png" : "jpeg"};base64,${base64}`
    : null;

  return (
    <div className="profile-page">
      <section className="card">
        <header className="card-header">
          <h2>{isUser ? "Buyer Profile" : "Seller Profile"}</h2>
        </header>

        <div className="avatar-block">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Profile"
              className="avatar"
              loading="lazy"
              width="192"
              height="192"
            />
          ) : (
            <div className="avatar placeholder">No Image</div>
          )}
          <h3 className="name">{profile.name}</h3>
          <p className="muted">{profile.role}</p>
        </div>

        <div className="info">
          <div className="row">
            <span className="label">ID</span>
            <span className="value">{profile.id}</span>
          </div>
          <div className="row">
            <span className="label">Email</span>
            <span className="value">{profile.email}</span>
          </div>
          <div className="row">
            <span className="label">Role</span>
            <span className="value">{profile.role}</span>
          </div>
        </div>

        <div className="section">
          <h4>Actions</h4>

          <div className="action-buttons">
            {isUser && (
              <>
                <button className="btn-glow" onClick={() => navigate("/orders")}>
                  🛒 Orders
                </button>
                <button className="btn-glow" onClick={() => navigate("/cart")}>
                  🛍 Cart
                </button>
              </>
            )}

            {isSeller && (
              <button className="btn-glow" onClick={() => navigate("/manage-orders")}>
                📦 Manage Orders
              </button>
            )}
          </div>
        </div>

        <div className="card-actions">
          <button onClick={() => navigate("/update")} className="btn-primary">
            Edit Profile
          </button>
          <button type="button" className="btn-outlined" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}
