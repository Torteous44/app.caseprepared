import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/CheckoutPage.module.css";
import "../styles.css";

const API_BASE_URL = "http://127.0.0.1:8000";

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

// Icons for feature cards
const InterviewsIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
  </svg>
);

const AnalysisIcon = () => (
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
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
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
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
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
        <h1>
          <span className={styles.welcomeTextBlue}>You're in.</span> Welcome to
          CasePrepared.
        </h1>
        <p>Your premium access is live. Let's start prepping.</p>

        <div className={styles.actionButtonGroup}>
          <Link
            to="/interviews"
            className={`btn btn-primary ${styles.actionButton}`}
          >
            Access interviews
          </Link>
          <Link to="/profile" className={styles.profileLink}>
            Profile
          </Link>
        </div>

        <div className={styles.thankYouSection}>
          <h2>A Big Thank You</h2>
          <p>
            We've emailed your receipt and account details to the address you
            provided. You now have full access to CasePrepared — including
            interactive mock interviews, real-time feedback, and expert-level
            frameworks.
          </p>
          <p>
            You can get started right away by{" "}
            <Link to="/interviews">going to the interviews page</Link>.
          </p>
          <p>Let's get to work — MBB isn't ready for you.</p>
        </div>

        <div className={styles.featuresGrid}>
          <div
            className={`${styles.featureCard} ${styles.featureCardInterviews}`}
          >
            <InterviewsIcon />
            <h3>
              Access <span className={styles.highlight}>premium</span>
              <br />
              <span className={styles.highlight}>interviews</span>
            </h3>
            <p>
              Unlock our library of expert-designed mock interviews modeled on
              real MBB and tech strategy cases.
            </p>
          </div>

          <div
            className={`${styles.featureCard} ${styles.featureCardAnalysis}`}
          >
            <AnalysisIcon />
            <h3>
              Detailed <span className={styles.highlight}>performance</span>
              <br />
              <span className={styles.highlight}>analysis</span>
            </h3>
            <p>
              See how you stack up. After each case, get a breakdown of your
              strengths, growth areas, and pacing.
            </p>
          </div>

          <div className={`${styles.featureCard} ${styles.featureCardSupport}`}>
            <SupportIcon />
            <h3>
              Full Resource Access
              <br />+ <span className={styles.highlight}>Direct Support</span>
            </h3>
            <p>
              Need help? Our team is just a message away — we're here to support
              your prep every step of the way.
            </p>
          </div>
        </div>

        <div className={styles.helpSection}>
          <h2>Need Help?</h2>
          <p>
            You can contact us anytime and we'll get back to you in &lt;24
            hours.
          </p>
          <a
            href="mailto:contact@caseprepared.com"
            className={`btn btn-outline ${styles.contactButton}`}
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
