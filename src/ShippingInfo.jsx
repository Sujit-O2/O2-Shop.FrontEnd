import React from "react";
import "./css/supportPages.css";

export default function ShippingInfo() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>Shipping Information</h1>
        <p>
          We deliver across India using trusted courier partners to ensure your products reach
          you safely and on time.
        </p>

        <h2>Shipping Time</h2>
        <ul>
          <li>Metro cities: 3–5 business days</li>
          <li>Other locations: 5–8 business days</li>
        </ul>

        <h2>Shipping Charges</h2>
        <p>
          Orders above ₹999 qualify for <strong>free shipping</strong>. A nominal fee of ₹49
          applies for smaller orders.
        </p>

        <h2>Order Tracking</h2>
        <p>
          Once shipped, you will receive a tracking link via email/SMS to monitor your package.
        </p>
      </div>
    </div>
  );
}
