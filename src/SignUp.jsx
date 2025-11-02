// Signup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./css/Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/signUp`, formData, {
        headers: { "Content-Type": "application/json",withCredentials: true },
      });

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        // normalize string/object response
        const message =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data?.message || "Unknown error";
        setApiError(`Signup failed: ${error.response.status} - ${message}`);
      } else {
        setApiError("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" role="region" aria-labelledby="signup-title">
        <header className="signup-header">
          <h2 id="signup-title">Create account</h2>
          <p className="subtitle">Join and start your journey</p>
        </header>

        {apiError && (
          <div className="alert" role="alert" aria-live="polite">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="field">
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="password" className="label">
                Password
              </label>
              <span className="hint">8+ characters</span>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="role" className="label">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select"
            >
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Creating…" : "Sign Up"}
          </button>

          <p className="footnote">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login
            </Link>
          </p>
        </form>
      </div>

      <p className="terms">By signing up, you agree to our Terms & Privacy.</p>
    </div>
  );
}
