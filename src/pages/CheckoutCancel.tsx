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
    stroke="#EF4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Icons for recommendation cards
const RetryIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0066CC"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);

const PaymentIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0066CC"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const SupportIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0066CC"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <path d="M12 11v.01"></path>
    <path d="M8 11v.01"></path>
    <path d="M16 11v.01"></path>
  </svg>
);

const CheckoutCancel: React.FC = () => {
  return (
    <div className="container">
      <div className={styles.cancelContainer}>
        <XCircleIcon />
        <h1>Payment Canceled</h1>
        <p>Your payment was canceled and you have not been charged.</p>

        <div className={styles.actionButtonGroup}>
          <Link
            to="/pricing"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Try Again
          </Link>
          <Link to="/profile" className={styles.profileLink}>
            Profile
          </Link>
        </div>

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

        <div className={styles.featuresGrid}>
          <div
            className={`${styles.featureCard} ${styles.featureCardInterviews}`}
          >
            <RetryIcon />
            <h3>
              <span className={styles.highlight}>Try Again</span>
              <br />
              Later
            </h3>
            <p>
              You can always come back and complete your subscription when
              you're ready. Your progress is saved.
            </p>
          </div>

          <div
            className={`${styles.featureCard} ${styles.featureCardAnalysis}`}
          >
            <PaymentIcon />
            <h3>
              <span className={styles.highlight}>Alternative</span>
              <br />
              Payment Methods
            </h3>
            <p>
              We support multiple payment options including credit cards,
              PayPal, and other regional payment systems.
            </p>
          </div>

          <div className={`${styles.featureCard} ${styles.featureCardSupport}`}>
            <SupportIcon />
            <h3>
              Need <span className={styles.highlight}>Help?</span>
              <br />
              We're Here
            </h3>
            <p>
              If you encountered any issues, our support team is ready to assist
              you with your subscription process.
            </p>
          </div>
        </div>

        <div className={styles.helpSection}>
          <h2>Still Interested?</h2>
          <p>
            CasePrepared can still help you ace your case interviews. Learn
            about our pricing options.
          </p>
          <Link
            to="/pricing"
            className={`btn btn-outline ${styles.contactButton}`}
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
