import React from "react";
import "./css/supportPages.css";

export default function FAQs() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>Frequently Asked Questions</h1>

        <h2>1. How can I track my order?</h2>
        <p>
          Once your order is shipped, you will receive an email with the tracking ID and link.
          You can also track your order directly from the “My Orders” section.
        </p>

        <h2>2. What payment methods do you accept?</h2>
        <p>
          We accept all major debit/credit cards, UPI, Net Banking, and wallets through Razorpay.
        </p>

        <h2>3. Can I cancel my order?</h2>
        <p>
          Orders can be canceled within 24 hours of placement. After dispatch, cancellation is not possible.
        </p>

        <h2>4. What if I receive a damaged product?</h2>
        <p>
          If your product is damaged or defective, please contact our support team within 48 hours for a replacement or refund.
        </p>
      </div>
    </div>
  );
}
