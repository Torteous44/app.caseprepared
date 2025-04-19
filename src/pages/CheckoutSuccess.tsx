import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/CheckoutPage.module.css";
import "../styles.css";

const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// CheckCircle Icon for success page
const CheckCircleIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10B981"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CheckoutSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setError("No session ID found");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // Verify the session with your backend
        const response = await fetch(
          `${API_BASE_URL}/api/v1/subscriptions/verify-session?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to verify session");
        }

        // Session verified successfully
        setLoading(false);
      } catch (err) {
        console.error("Session verification error:", err);
        setError(
          `${err instanceof Error ? err.message : "Unknown verification error"}`
        );
        setLoading(false);
      }
    };

    verifySession();
  }, [location.search]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>!</div>
          <h1>Verification Error</h1>
          <p>{error}</p>
          <Link
            to="/profile"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.successContainer}>
        <CheckCircleIcon />
        <h1>Payment Successful!</h1>
        <p>
          Thank you for your subscription. Your account has been upgraded to
          premium.
        </p>
        <p className={styles.detailText}>
          You now have full access to all features including AI case interviews,
          personalized feedback, and detailed analytics.
        </p>
        <div className={styles.actionButtonGroup}>
          <Link
            to="/profile"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Go to Profile
          </Link>
          <Link
            to="/interviews"
            className={`btn btn-secondary ${styles.actionButton}`}
          >
            Start Practice Interviews
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
