import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./PricingCardNew.module.css";

// API base URL
const API_BASE_URL = "https://caseprepcrud.onrender.com";

// Determine the app domain to redirect to
const APP_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://app.caseprepared.com";

interface PricingCardNewProps {
  type: "left" | "right";
  className?: string;
  imageTop?: string;
  imageLeft?: string;
  imageRotation?: string;
}

const PricingCardNew: React.FC<PricingCardNewProps> = ({
  type,
  className = "",
  imageTop = "45%",
  imageLeft = "50%",
  imageRotation = "3deg",
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize currency symbol immediately to prevent layout shift
  const [currencySymbol] = useState(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isEurope = /Europe|Berlin|Paris|Rome|Madrid|Amsterdam/.test(
        timezone
      );
      const isAmerica = /America|New_York|Los_Angeles|Chicago|Toronto/.test(
        timezone
      );

      if (isAmerica) {
        return "$";
      } else if (isEurope) {
        return "€";
      } else {
        return "$";
      }
    } catch {
      return "$"; // Fallback if timezone detection fails
    }
  });

  // Ensure component is fully initialized before rendering
  useEffect(() => {
    // Small delay to ensure CSS variables are loaded
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleStripeCheckout = async (
    plan: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log("Checkout request:", { plan });

      // Call backend endpoint to create checkout session - Updated to match API docs
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/billing/checkout`,
        {
          plan: plan,
          success_url: `${APP_DOMAIN}/checkout/success`,
          cancel_url: `${APP_DOMAIN}/checkout/cancel`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (err) {
      console.error("Checkout error:", err);
      if (axios.isAxiosError(err)) {
        console.error("Error details:", err.response?.data);
      }
      setError(
        `${
          err instanceof Error
            ? err.message
            : "Failed to start checkout process"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    // Map selected plan to the plan names expected by the API
    let plan = "";

    switch (selectedPlan) {
      case "monthly":
        plan = "monthly";
        break;
      case "believer":
        plan = "believer";
        break;
      case "threemonth":
        plan = "threemonth";
        break;
      default:
        plan = "monthly"; // Default to monthly
    }

    // Open Stripe checkout directly
    handleStripeCheckout(plan);
  };

  // Don't render until initialized to prevent layout issues
  if (!isInitialized) {
    return (
      <div
        className={`${styles.card} ${styles.leftCard} ${className}`}
        style={{ opacity: 0 }}
      >
        <div style={{ height: "430px" }} />{" "}
        {/* Placeholder to maintain space */}
      </div>
    );
  }

  if (type === "left") {
    return (
      <div className={`${styles.card} ${styles.leftCard} ${className}`}>
        <div className={styles.logoContainer}>
          <img
            src="/assets/Logo Text.svg"
            alt="CasePrepared"
            className={styles.logo}
          />
          <span className={styles.premium}>Premium</span>
        </div>

        <p className={styles.description}>
          Practice with 20+ case interviews from top MBB firms. New interviews
          every week.
        </p>

        <div className={styles.buttonRow}>
          <button
            className={`${styles.planButton} ${
              selectedPlan === "monthly" ? styles.selected : ""
            }`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <div className={styles.buttonContent}>
              <div className={styles.planInfo}>
                <div className={styles.planType}>Monthly</div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{currencySymbol}29.99</span>
                  <span className={styles.period}>/ month</span>
                </div>
                <div className={styles.caption}>Cancel anytime</div>
              </div>
              <div
                className={`${styles.radioCircle} ${
                  selectedPlan === "monthly" ? styles.selected : ""
                }`}
              />
            </div>
          </button>

          <button
            className={`${styles.planButton} ${
              selectedPlan === "believer" ? styles.selected : ""
            }`}
            onClick={() => setSelectedPlan("believer")}
          >
            <div className={styles.buttonContent}>
              <div className={styles.planInfo}>
                <div className={styles.planType}>Believer</div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{currencySymbol}200.00</span>
                </div>
                <div className={styles.caption}>One-time payment</div>
              </div>
              <div
                className={`${styles.radioCircle} ${
                  selectedPlan === "believer" ? styles.selected : ""
                }`}
              />
            </div>
          </button>
        </div>

        <button
          className={`${styles.planButton} ${styles.fullWidth} ${
            selectedPlan === "threemonth" ? styles.selected : ""
          }`}
          onClick={() => setSelectedPlan("threemonth")}
        >
          <div className={styles.buttonContent}>
            <div className={styles.planInfo}>
              <div className={styles.planTypeRow}>
                <div className={styles.planType}>Buy for 3 Months</div>
                <div className={styles.savings}>Save 20%</div>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{currencySymbol}21.99</span>
                <span className={styles.period}>/ month</span>
              </div>
              <div className={styles.caption}>Cancel anytime</div>
            </div>
            <div
              className={`${styles.radioCircle} ${
                selectedPlan === "threemonth" ? styles.selected : ""
              }`}
            />
          </div>
        </button>

        <div className={styles.securityInfo}>
          <span>Payments secured with </span>
          <a
            href="https://stripe.com/resources/more/secure-payment-systems-explained#:~:text=When%20a%20customer%20enters%20payment,be%20encrypted%20for%20added%20security."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.stripeLink}
          >
            Stripe
          </a>
          <Lock className={styles.lockIcon} />
        </div>

        <button
          className={styles.joinButton}
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Processing..." : "Join Today"}
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  // Right card - with image
  const imageStyle = {
    "--image-top": imageTop,
    "--image-left": imageLeft,
    "--image-rotation": imageRotation,
  } as React.CSSProperties;

  return (
    <div className={`${styles.card} ${styles.rightCard} ${className}`}>
      <img
        src="/assets/CaseprepPrem.png"
        alt="CasePrepared Premium"
        className={styles.rightCardImage}
        style={imageStyle}
      />
    </div>
  );
};

export default PricingCardNew;
