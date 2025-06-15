import React from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import styles from "../styles/CheckoutPage.module.css";
import "../styles.css";
import errorAnimation from "../assets/animations/error.json";

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

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6"/>
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
        <Lottie 
          animationData={errorAnimation} 
          className={styles.errorAnimation}
        />
        <h1>Payment Canceled</h1>
        <p>Your payment was canceled and you have not been charged.</p>

        <div className={styles.actionButtonGroup}>
          <Link
            to="/pricing"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Try Again
          </Link>
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
            <Link to="/profile" className={styles.featureCardLink}>
              Profile <ChevronRight />
            </Link>
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
            <Link to="/pricing" className={styles.featureCardLink}>
              Explore <ChevronRight />
            </Link>
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
            <a href="mailto:contact@caseprepared.com" className={styles.featureCardLink}>
              Contact us <ChevronRight />
            </a>
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
            className={`btn btn-primary ${styles.actionButton}`}
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
