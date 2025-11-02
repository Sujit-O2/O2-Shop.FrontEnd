import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./css/login.css";

function Login({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

    const role = res.data?.role;

    if (role) {
      if (setUserRole) setUserRole(role);
      if (role === "SELLER") navigate("/seller/dashboard");
      else if (role === "USER") navigate("/dashboard");
      else setError("Invalid role value.");
    } else {
      setError("Login failed: Role missing.");
    }
  } catch (error) {
    console.error("Login error:", error);
    setError("Login failed. Please check your credentials.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="login-page">
      <div className="login-card" role="region" aria-labelledby="login-title">
        <div className="login-header">
          <h2 id="login-title">Welcome back</h2>
          <p className="subtitle">Sign in to continue to your dashboard</p>
        </div>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
            
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="footnote">
          Don’t have an account?{" "}
          <Link to="/signup" className="link">
            Sign Up
          </Link>
        </p>
      </div>

      <p className="terms">By continuing, you agree to our Terms & Privacy.</p>
    </div>
  );
}

export default Login;
