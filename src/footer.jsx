import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedinIn, 
  FaPaperPlane, 
  FaCheckCircle, 
  FaExclamationCircle 
} from "react-icons/fa";
import "./css/footer.css";
import logo from "./assets/O2.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus(null);
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/mail/newSus`, null, {
        params: { email },
      });
      setMessage("Subscribed successfully!");
      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      setMessage("Subscription failed. Try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* 1. Brand & About */}
        <div className="footer-section brand-section">
          <div className="brand-header">
            <img src={logo} alt="O2 Logo" className="footer-logo" />
            <h2 className="brand-name">O2 Shop</h2>
          </div>
          <p className="brand-desc">
            Your premium destination for fashion, electronics, and lifestyle products. 
            Quality meets convenience at O2 Shop.
          </p>
          <div className="social-icons">
            <a href="#" className="social-link"><FaFacebookF /></a>
            <a href="#" className="social-link"><FaInstagram /></a>
            <a href="#" className="social-link"><FaTwitter /></a>
            <a href="#" className="social-link"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div className="footer-section links-section">
          <h3>Customer Care</h3>
          <ul>
            <li><Link to="/orders">Track Order</Link></li>
            <li><Link to="/returns">Returns & Refunds</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        {/* 3. Company */}
        <div className="footer-section links-section">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/seller/signup">Become a Seller</Link></li>
          </ul>
        </div>

        {/* 4. Newsletter */}
        <div className="footer-section newsletter-section">
          <h3>Stay in the Loop</h3>
          <p>Subscribe for exclusive deals and updates.</p>
          
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? <span className="loader"></span> : <FaPaperPlane />}
              </button>
            </div>
          </form>

          {message && (
            <div className={`status-msg ${status}`}>
              {status === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              <span>{message}</span>
            </div>
          )}

          <div className="payment-methods">
             <p>Secured Payments:</p>
             <div className="payment-icons">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" />
             </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="bottom-content">
          <p>© {new Date().getFullYear()} O2 Shop. All Rights Reserved.</p>
          
          <div className="powered-by">
            <span>Powered by</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
              alt="Razorpay"
              className="razorpay-logo"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}