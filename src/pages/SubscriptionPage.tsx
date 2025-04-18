import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "../styles/SubscriptionPage.module.css";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// Debug helper - Keep this but don't show debug UI
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51RCljTIhI9uxpDniw1nrCg741oii1w2qMPyJQ2HWkpBuceTOjmPpFmgQaZXRrb8LbdtXbuHjdrCeMEHpAkSIUuYk00mLWxDdRP"
);

// Lock Icon SVG as component
const LockIcon = () => (
  <svg
    className={styles.securityIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#777777"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// Shield Icon SVG as component
const ShieldIcon = () => (
  <svg
    className={styles.securityIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#777777"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

interface SubscriptionStatus {
  status?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  id?: string;
  user_id?: string;
  plan?: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Card options for consistent styling
const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: "antialiased",
    },
    invalid: {
      color: "#c01048",
      iconColor: "#c01048",
    },
  },
  hidePostalCode: true,
};

// Card display component
const CardForm = ({
  onCardChange,
}: {
  onCardChange: (complete: boolean) => void;
}) => {
  return (
    <div className={styles.formRow}>
      <label className={styles.cardLabel}>Card details</label>
      <CardElement
        options={CARD_OPTIONS}
        className={styles.cardElement}
        onChange={(e) => onCardChange(e.complete)}
      />
    </div>
  );
};

// Checkout Form Component (separated)
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Create stable callback for card change
  const handleCardChange = useCallback((complete: boolean) => {
    setCardComplete(complete);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("The payment system is still loading. Please try again.");
      return;
    }

    if (!cardComplete) {
      setError("Please complete your card details before submitting.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Process subscription with backend
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/subscriptions/create-stripe-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_method_id: paymentMethod.id,
            price_id: "price_1RClmJIhI9uxpDni996tXg6s",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create subscription");
      }

      const data = await response.json();

      // Handle additional confirmation if needed
      if (data.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.client_secret
        );
        if (confirmError) {
          throw new Error(
            `Payment confirmation failed: ${confirmError.message}`
          );
        }
      }

      // Success state
      setSucceeded(true);

      // Reload page after a brief delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Subscription error:", err);
      setError(
        `${err instanceof Error ? err.message : "Unknown payment error"}`
      );
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className={styles.successMessage}>
        <h3>Subscription created successfully!</h3>
        <p>Refreshing your page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.checkoutForm}>
      {/* Always render the card element, even during processing */}
      <CardForm onCardChange={handleCardChange} />

      {error && <div className={styles.errorMessage}>{error}</div>}

      <button
        type="submit"
        disabled={!stripe || !cardComplete || processing}
        className={styles.subscribeButton}
      >
        {processing ? "Processing..." : "Subscribe"}
      </button>

      {processing && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Processing your payment...</p>
        </div>
      )}

      <div className={styles.paymentFooter}>
        <div className={styles.securityInfo}>
          <LockIcon /> Your payment information is processed securely
        </div>
        <div className={styles.securityInfo}>
          <ShieldIcon /> 256-bit SSL encryption
        </div>
        <div className={styles.stripeBadge}>
          <img src="/PoweredByStripe.svg" alt="Powered by Stripe" />
        </div>
      </div>
    </form>
  );
};

// The main Subscription Page component
const SubscriptionPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  useEffect(() => {
    logDebug("SubscriptionPage mounted");

    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      logDebug("Fetching subscription status...");
      const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      logDebug("Subscription response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        logDebug("Raw subscription data:", data);

        // If data is an array, take the first element
        const subscriptionData = Array.isArray(data) ? data[0] : data;
        logDebug("Processed subscription data:", subscriptionData);

        setSubscription(subscriptionData);
      } else {
        console.error("Failed to fetch subscription:", response.statusText);
        setError(`Failed to fetch subscription: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setMessage("Failed to load subscription information");
      setError(
        `Error fetching subscription: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/subscriptions/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel subscription");
      }

      setMessage(
        "Your subscription has been cancelled. You will still have access until the end of your billing period."
      );
      fetchSubscription(); // Refresh subscription status
    } catch (error) {
      console.error("Cancellation error:", error);
      setMessage(
        `Cancellation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(parseInt(dateString) * 1000).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <h1>Subscription</h1>
          <p>Please log in to manage your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.subscriptionCard}>
        <h1>Premium Subscription</h1>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading subscription details...</p>
          </div>
        ) : (
          <>
            {/* Subscription Plan Details */}
            <div className={styles.planDetails}>
              <div className={styles.priceContainer}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>39.99</span>
                <span className={styles.period}>/month</span>
              </div>

              <ul className={styles.features}>
                <li>100+ mock interviews</li>
                <li>Real time interview insights</li>
                <li>AI powered performance reviews</li>
                <li>Direct access to professionals</li>
              </ul>
            </div>

            {/* Current Subscription Status */}
            {subscription && subscription.status === "active" ? (
              <div className={styles.subscriptionStatus}>
                <div className={styles.statusIndicator}>
                  <div className={styles.activeIcon}></div>
                  <span>Active</span>
                </div>

                {subscription.current_period_end && (
                  <p className={styles.renewalInfo}>
                    Renews on {formatDate(subscription.current_period_end)}
                  </p>
                )}

                <button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={loading || subscription.cancel_at_period_end}
                >
                  {subscription.cancel_at_period_end
                    ? "Cancellation scheduled"
                    : "Cancel subscription"}
                </button>

                <div className={styles.paymentFooter}>
                  <div className={styles.stripeBadge}>
                    <img src="/PoweredByStripe.svg" alt="Powered by Stripe" />
                  </div>
                </div>
              </div>
            ) : (
              /* Create a new Elements instance for the checkout form */
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}

            {message && <div className={styles.message}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
