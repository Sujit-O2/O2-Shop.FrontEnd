import React from "react";
import "./css/supportPages.css";

export default function ReturnPolicy() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>Return & Refund Policy</h1>
        <p>
          We want you to love what you ordered! If you are not satisfied, you can return most
          items within <strong>7 days of delivery</strong>.
        </p>

        <h2>Eligibility for Return</h2>
        <ul>
          <li>Item must be unused and in original packaging.</li>
          <li>Invoice or order confirmation must be provided.</li>
          <li>Returns are not applicable for hygiene-related items or digital products.</li>
        </ul>

        <h2>Refund Process</h2>
        <p>
          Once the product is received and inspected, refunds are processed to your original
          payment method within 3–7 business days.
        </p>
      </div>
    </div>
  );
}
