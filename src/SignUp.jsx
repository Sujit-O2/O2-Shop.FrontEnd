import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaStore, FaUserAlt } from "react-icons/fa";
import "./css/Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  
  // Dynamic States
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();

  // Real-time validation logic
  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) errorMsg = "Please enter a valid email address.";
    }
    if (name === "password") {
      if (value.length < 8) errorMsg = "Password must be at least 8 characters.";
    }
    if (name === "name") {
      if (value.trim().length < 2) errorMsg = "Name is too short.";
    }
    
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiError(null);
    setFormData({ ...formData, [name]: value });
    
    // Trigger validation on change
    validateField(name, value);
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email.";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be 8+ chars.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/signUp`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Correct placement for axios config
      });

      // You might want a toast notification here instead of alert
      alert("Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        const message = typeof error.response.data === "string"
            ? error.response.data
            : error.response.data?.message || "Unknown error";
        setApiError(message);
      } else {
        setApiError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Decorative Background Circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>

      <div className="signup-card">
        <header className="signup-header">
          <h2>Create Account</h2>
          <p>Join us and start your journey</p>
        </header>

        {apiError && (
          <div className="error-banner">
            <span>!</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className={`input-group ${errors.name ? "error" : ""}`}>
            <div className="icon-wrapper"><FaUser /></div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}

          {/* Email Field */}
          <div className={`input-group ${errors.email ? "error" : ""}`}>
            <div className="icon-wrapper"><FaEnvelope /></div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}

          {/* Password Field */}
          <div className={`input-group ${errors.password ? "error" : ""}`}>
            <div className="icon-wrapper"><FaLock /></div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}

          {/* Visual Role Selector */}
          <div className="role-selection">
            <p className="label">I want to be a:</p>
            <div className="role-options">
              <div 
                className={`role-card ${formData.role === "USER" ? "active" : ""}`}
                onClick={() => handleRoleSelect("USER")}
              >
                <FaUserAlt className="role-icon" />
                <span>User</span>
              </div>
              <div 
                className={`role-card ${formData.role === "SELLER" ? "active" : ""}`}
                onClick={() => handleRoleSelect("SELLER")}
              >
                <FaStore className="role-icon" />
                <span>Seller</span>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Sign Up"}
          </button>
        </form>

        <footer className="signup-footer">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}