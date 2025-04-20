import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/PricingCards.module.css";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

const CheckIcon = () => (
  <svg
    width="12"
    height="13"
    viewBox="0 0 12 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.25 6.875L5.25 9.875L9.75 3.125"
      stroke="#848484"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface PricingCardsProps {
  hasSubscription?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  hasSubscription = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFreeSignup = () => {
    if (isAuthenticated) {
      // If authenticated, navigate to profile page
      navigate("/profile");
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

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
      if (hasSubscription) {
        // If authenticated with subscription, navigate to profile
        navigate("/profile");
      } else {
        // If authenticated without subscription, open Stripe checkout directly
        handleStripeCheckout("price_1RFeEdIzbD323IQGvtSOXEsy");
      }
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

  const handleEnterprise = () => {
    window.location.href = "mailto:contact@caseprepared.com";
  };

  return (
    <div className={styles.pricingCardsContainer}>
      {/* Free Plan */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className={styles.cardHeader}>Try it out</div>
        <div className={styles.pricingCard}>
          <div className={`${styles.badgePill} ${styles.freeBadge}`}>Free</div>
          <h3 className={styles.cardTitle}>Three mock case interviews</h3>
          <ul className={styles.cardFeatures}>
            <li>
              <CheckIcon /> Free case interviews
            </li>
            <li>
              <CheckIcon /> Limited interview analysis
            </li>
            <li>
              <CheckIcon /> CasePrepared resources
            </li>
          </ul>
          <div className={styles.divider}></div>
          <div className={styles.cardPrice}>
            <div className={styles.priceRow}>
              <span className={styles.currency}>US $0</span>
            </div>
            <span className={styles.period}>Free</span>
          </div>
          <button
            className={`${styles.cardButton} ${
              isAuthenticated && !hasSubscription
                ? styles.currentPlanButton
                : ""
            }`}
            onClick={handleFreeSignup}
          >
            {isAuthenticated && !hasSubscription
              ? "Current Plan"
              : "Start Free Trial"}
          </button>
        </div>
      </div>

      {/* Premium Plan */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className={styles.cardHeader}>
          Our <span className={styles.blueText}>most popular</span>
        </div>
        <div className={`${styles.pricingCard} ${styles.premiumCard}`}>
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
              <CheckIcon /> Personalized software
            </li>
          </ul>
          <div className={styles.premiumDivider}></div>
          <div className={styles.cardPrice}>
            <div className={styles.priceRow}>
              <span className={`${styles.currency} ${styles.premiumPrice}`}>
                US $39.99
              </span>
              <span className={styles.period}>monthly</span>
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
              : isAuthenticated && hasSubscription
              ? "Current Plan"
              : "Join today"}
          </button>
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      </div>

      {/* Enterprise Plan */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className={styles.cardHeader}>
          For your <span className={styles.blueText}>organization</span>
        </div>
        <div className={`${styles.pricingCard} ${styles.enterpriseCard}`}>
          <div className={`${styles.badgePill} ${styles.enterpriseBadge}`}>
            Enterprise
          </div>
          <h3 className={styles.cardTitle}>For your organization</h3>
          <ul className={styles.cardFeatures}>
            <li>
              <CheckIcon /> Unlimited access
            </li>
            <li>
              <CheckIcon /> Seat based usage
            </li>
            <li>
              <CheckIcon /> Tailored for you
            </li>
          </ul>
          <div className={styles.enterpriseDivider}></div>
          <div className={styles.cardPrice}>
            <div className={styles.priceRow}>
              <span className={styles.contactUs}>Contact us</span>
            </div>
            <span className={styles.customQuote}>To set up your account</span>
          </div>
          <button
            className={`${styles.cardButton} ${styles.enterpriseButton}`}
            onClick={handleEnterprise}
          >
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCards;
