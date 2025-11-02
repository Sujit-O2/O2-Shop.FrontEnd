import React from "react";
import "./css/supportPages.css";

export default function ContactUs() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>Contact Us</h1>
        <p>
          Have a question or issue? Our support team is always ready to help you.
        </p>

        <h2>Customer Support</h2>
        <p>Email: <a href="Sujitswain077@gmail.com">support@o2shop.com</a></p>
        <p>Phone: +91 9348720753</p>

        <h2>Business Hours</h2>
        <p>Monday – Saturday: 9:00 AM – 7:00 PM</p>

        <h2>Office Address</h2>
        <p>
          O2 Shop . Pvt. Ltd.<br />
          45 Sujit ss Road,<br />
          Jagatsinghpur, India
        </p>
      </div>
    </div>
  );
}
