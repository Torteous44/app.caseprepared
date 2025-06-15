import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./PricingCardNew.module.css";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

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
  imageRotation = "3deg"
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  // Initialize currency symbol immediately to prevent layout shift
  const [currencySymbol] = useState(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isEurope = /Europe|Berlin|Paris|Rome|Madrid|Amsterdam/.test(timezone);
      const isAmerica = /America|New_York|Los_Angeles|Chicago|Toronto/.test(timezone);

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

  const handleStripeCheckout = async (priceId: string, isOneTime: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Different request body for one-time payments vs subscriptions
      const requestBody = isOneTime ? {
        price_id: priceId,
        mode: "payment", // For one-time payments
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
      } : {
        price_id: priceId,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
      };

      console.log("Checkout request:", { priceId, isOneTime, requestBody });

      // Call backend endpoint to create checkout session
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/subscriptions/create-checkout-session`,
        requestBody,
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
    if (isAuthenticated) {
      // Map selected plan to price ID
      let priceId = "";
      let isOneTime = false;
      
      switch (selectedPlan) {
        case "monthly":
          priceId = "price_1RaFI8IzbD323IQGSk75ygX0"; // $29.99
          isOneTime = false;
          break;
        case "believer":
          priceId = "price_1RaFJ9IzbD323IQGzslYNzzW"; // $200.00
          isOneTime = true; // This is a one-time payment
          break;
        case "threemonth":
          priceId = "price_1RaFISIzbD323IQGKD5lBMcG"; // $21.99
          isOneTime = false;
          break;
        default:
          priceId = "price_1RaFI8IzbD323IQGSk75ygX0"; // Default to monthly
          isOneTime = false;
      }
      
      // If authenticated, open Stripe checkout directly
      handleStripeCheckout(priceId, isOneTime);
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

  // Don't render until initialized to prevent layout issues
  if (!isInitialized) {
    return (
      <div className={`${styles.card} ${styles.leftCard} ${className}`} style={{ opacity: 0 }}>
        <div style={{ height: '430px' }} /> {/* Placeholder to maintain space */}
      </div>
    );
  }

  if (type === "left") {
    return (
      <div className={`${styles.card} ${styles.leftCard} ${className}`}>
        <div className={styles.logoContainer}>
          <img src="/assets/Logo Text.svg" alt="CasePrepared" className={styles.logo} />
          <span className={styles.premium}>Premium</span>
        </div>
        
        <p className={styles.description}>
          Practice with 20+ case interviews from top MBB firms. New interviews every week.
        </p>
        
        <div className={styles.buttonRow}>
          <button 
            className={`${styles.planButton} ${selectedPlan === 'monthly' ? styles.selected : ''}`}
            onClick={() => setSelectedPlan('monthly')}
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
              <div className={`${styles.radioCircle} ${selectedPlan === 'monthly' ? styles.selected : ''}`} />
            </div>
          </button>
          
          <button 
            className={`${styles.planButton} ${selectedPlan === 'believer' ? styles.selected : ''} ${styles.disabled}`}
            onClick={() => {/* Disabled for now */}}
            disabled={true}
          >
            <div className={styles.buttonContent}>
              <div className={styles.planInfo}>
                <div className={styles.planType}>Believer</div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{currencySymbol}200.00</span>
                </div>
                <div className={styles.caption}>Temporarily unavailable</div>
              </div>
              <div className={`${styles.radioCircle} ${selectedPlan === 'believer' ? styles.selected : ''}`} />
            </div>
          </button>
        </div>
        
        <button 
          className={`${styles.planButton} ${styles.fullWidth} ${selectedPlan === 'threemonth' ? styles.selected : ''}`}
          onClick={() => setSelectedPlan('threemonth')}
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
            <div className={`${styles.radioCircle} ${selectedPlan === 'threemonth' ? styles.selected : ''}`} />
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
    '--image-top': imageTop,
    '--image-left': imageLeft,
    '--image-rotation': imageRotation,
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