import { Check } from "lucide-react";
import styles from "./PricingCard.module.css";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// Check icon component to match PricingCards.tsx
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8L6.5 11.5L13 4.5"
      stroke="var(--blue-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PricingCard() {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("€");
  const [price, setPrice] = useState("39.99");

  useEffect(() => {
    // Get user's location based on browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isEurope = /Europe|Berlin|Paris|Rome|Madrid|Amsterdam/.test(timezone);
    const isAmerica = /America|New_York|Los_Angeles|Chicago|Toronto/.test(
      timezone
    );

    // Set currency based on location
    if (isAmerica) {
      setCurrencySymbol("$");
    } else if (isEurope) {
      setCurrencySymbol("€");
    } else {
      // Default to euros for other regions
      setCurrencySymbol("€");
    }
  }, []);

  const handleStripeCheckout = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Call backend endpoint to create checkout session
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/subscriptions/create-checkout-session`,
        {
          price_id: priceId,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
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
    if (isAuthenticated) {
      // If authenticated, open Stripe checkout directly
      handleStripeCheckout("price_1RFeEdIzbD323IQGvtSOXEsy");
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

  return (
    <div className={styles.pricingCard}>
      <div className={`${styles.premiumCard}`}>
        <div className={`${styles.badgePill} ${styles.premiumBadge}`}>
          Premium
        </div>
        <h3 className={styles.cardTitle}>Access all case interviews</h3>
        <ul className={styles.cardFeatures}>
          <li>
            <CheckIcon /> 20+ case interviews
          </li>
          <li>
            <CheckIcon /> Full interview analysis
          </li>
          <li>
            <CheckIcon /> Interview preparation resources
          </li>
        </ul>
        <div className={styles.divider}></div>
        <div className={styles.cardPrice}>
          <div className={styles.priceRow}>
            <span className={`${styles.currency} ${styles.premiumPrice}`}>
              {currencySymbol}
              {price}
            </span>
            <span className={styles.period}>/month</span>
          </div>
          <span className={styles.billingPeriod}>Billed monthly</span>
        </div>
        <button
          className={`${styles.cardButton} ${styles.premiumButton}`}
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : isAuthenticated
            ? "Subscribe Now"
            : "Join today"}
        </button>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
}
