import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; // Using colored Google icon
import "./css/login.css";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { gmail: email, pass: password },
        { withCredentials: true }
      );

      const role = res.data.role || getCookie("role");

      if (role) {
        if (setUserRole) setUserRole(role);
        // Small delay for UI smoothness
        setTimeout(() => {
            if (role === "SELLER") navigate("/seller/dashboard");
            else if (role === "USER") navigate("/dashboard");
            else setError("Invalid role value.");
        }, 800);
      } else {
        setError("Login failed: Role missing.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Invalid email or password."
      );
      setLoading(false); // Stop loading immediately on error
    }
  };

  return (
    <div className="login-page">
      {/* Abstract Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="login-card fade-in-up">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p className="subtitle">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="error-alert shake">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className={`input-container ${email ? 'active' : ''}`}>
              <FaEnvelope className="field-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className={`input-container ${password ? 'active' : ''}`}>
              <FaLock className="field-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="forgot-wrapper">
               <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <div className="spinner-dots"></div> : "Sign In"}
          </button>
        </form>

        <div className="divider-container">
          <span className="divider-line"></span>
          <span className="divider-text">OR</span>
          <span className="divider-line"></span>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL}/oauth2/authorization/google`}
          className="btn-google"
        >
          <FcGoogle size={22} />
          <span>Continue with Google</span>
        </a>

        <div className="signup-footer">
          <p>
            Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;