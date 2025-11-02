import React, { useState } from "react";
import axios from "axios";
import "./css/footer.css";
import logo from "./assets/O2.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/mail/newSus`, null, {
  params: { email },
})
      setMessage("✅ Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      setMessage("❌ Failed to subscribe. Please try again later.");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Info */}
        <div className="footer-section about">
          <div className="footer-brand">
            <img src={logo} alt="O2 Logo" className="footer-logo" />
            <h2 className="brand-name">O2 Shop.</h2>
          </div>
          <p>
            Your one-stop destination for premium fashion, electronics, and home
            products. Trusted by thousands of happy customers worldwide.
          </p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-x-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        {/* Support Links */}
        <div className="footer-section links">
          <h3>Support</h3>
          <ul>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/returns">Return Policy</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to get the latest deals and product updates!</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send</button>
          </form>
          {message && <p className="newsletter-message">{message}</p>}
          <div className="payment-icons">
            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968299.png" alt="Visa" />
            <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="MasterCard" />
            <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="PayPal" />
            <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="UPI" />
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} O2 Shop . | All Rights Reserved</p>

        {/* Razorpay Logo */}
        <div className="powered-by">
          <span>Payments powered by</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
            alt="Razorpay"
            className="razorpay-logo"
          />
        </div>
      </div>
    </footer>
  );
}
