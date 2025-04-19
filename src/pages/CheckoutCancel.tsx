import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/CheckoutPage.module.css";
import "../styles.css";

// XCircle Icon for cancel page
const XCircleIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CheckoutCancel: React.FC = () => {
  return (
    <div className="container">
      <div className={styles.cancelContainer}>
        <XCircleIcon />
        <h1>Payment Canceled</h1>
        <p>Your payment was canceled and you have not been charged.</p>

        <div className={styles.infoSection}>
          <h2>Common reasons for cancellation:</h2>
          <ul>
            <li>Changed your mind about subscribing</li>
            <li>Need to use a different payment method</li>
            <li>Encountered an issue during the payment process</li>
          </ul>
          <p>
            If you experienced technical difficulties, please try again or
            contact our support team.
          </p>
        </div>

        <div className={styles.actionButtonGroup}>
          <Link
            to="/profile"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Return to Profile
          </Link>
          <Link
            to="/support"
            className={`btn btn-secondary ${styles.actionButton}`}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
