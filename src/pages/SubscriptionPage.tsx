import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { Appearance } from "@stripe/stripe-js";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/SubscriptionPage.module.css";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// Use test key for development
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RCljTIhI9uxpDniw1nrCg741oii1w2qMPyJQ2HWkpBuceTOjmPpFmgQaZXRrb8LbdtXbuHjdrCeMEHpAkSIUuYk00mLWxDdRP";
// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Custom appearance for Stripe Elements
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#174EA6",
    colorBackground: "#ffffff",
    colorText: "#424770",
    colorDanger: "#e76f51",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    spacingUnit: "4px",
    borderRadius: "4px",
  },
  rules: {
    ".Label": {
      marginBottom: "8px",
      fontWeight: "500",
    },
    ".Input": {
      padding: "12px",
    },
    ".Tab": {
      padding: "10px 16px",
      borderRadius: "4px",
    },
    ".Tab:hover": {
      color: "#2a9d8f",
    },
    ".Tab--selected": {
      borderColor: "#2a9d8f",
      color: "#2a9d8f",
    },
  },
};

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

// Debug helper - Keep this but don't show debug UI
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Separate CheckoutForm component to use Stripe Elements
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasCheckoutError, setHasCheckoutError] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  // Price ID from Stripe for the €40/month plan
  const PRICE_ID = "price_1RClmJIhI9uxpDni996tXg6s";

  const collectPaymentMethod = async () => {
    if (!stripe || !elements) {
      setMessage("Stripe has not been initialized completely");
      return null;
    }

    setLoading(true);
    setMessage("");
    setHasCheckoutError(false);

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create PaymentMethod using the card element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: user?.full_name || "Customer",
          email: user?.email,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      logDebug("Payment method created:", paymentMethod.id);
      // Store the payment method ID
      setPaymentMethodId(paymentMethod.id);

      // Return the payment method ID
      return paymentMethod.id;
    } catch (error) {
      console.error("Payment method error:", error);
      setMessage(
        `Payment method setup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setHasCheckoutError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSubscriptionIntent = async (paymentMethodId: string) => {
    setLoading(true);
    setMessage("");
    setHasCheckoutError(false);

    try {
      const token = localStorage.getItem("access_token");

      logDebug("Creating subscription with price ID:", PRICE_ID);
      logDebug("Using payment method ID:", paymentMethodId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/subscriptions/create-stripe-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price_id: PRICE_ID,
            payment_method_id: paymentMethodId,
          }),
        }
      );

      logDebug("Response status:", response.status);
      const result = await response.json();
      logDebug("Response body:", result);

      if (!response.ok) {
        throw new Error(
          result.detail || result.message || "Failed to create subscription"
        );
      }

      setMessage("Subscription created successfully!");
      // Refresh the parent component by triggering a reload
      window.location.reload();
    } catch (error) {
      console.error("Subscription setup error:", error);
      setMessage(
        `Subscription setup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setHasCheckoutError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe has not been initialized completely");
      return;
    }

    setLoading(true);

    try {
      // First collect payment method
      const paymentMethodId = await collectPaymentMethod();

      if (!paymentMethodId) {
        throw new Error("Failed to create payment method");
      }

      // Then create subscription with the payment method
      await createSubscriptionIntent(paymentMethodId);
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage(
        `Subscription failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setHasCheckoutError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.formGroup}>
        <label htmlFor="card-element" className={styles.cardLabel}>
          Card details
        </label>
        <div className={styles.cardElementContainer}>
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className={styles.subscribeButton}
      >
        {loading ? "Processing..." : "Subscribe Now"}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            hasCheckoutError ? styles.error : styles.success
          }`}
        >
          {message}
        </div>
      )}

      <div className={styles.testingInfo}>
        <p>For testing, use card number: 4242 4242 4242 4242</p>
        <p>Use any future date for expiry and any 3 digits for CVC</p>
      </div>
    </form>
  );
};

const SubscriptionPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log component mounting
    logDebug("SubscriptionPage mounted");

    // Fetch current subscription status when component mounts
    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

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
        <h1>Subscription</h1>
        <p>Please log in to manage your subscription.</p>
      </div>
    );
  }

  // SIMPLIFIED RENDER FUNCTION WITH IMPROVED STYLING
  return (
    <div className={styles.container}>
      <div className={styles.subscriptionCard}>
        <h1>CasePrepared Premium Subscription</h1>

        {/* Always show the plan details */}
        <div className={styles.planDetails}>
          <h2>Monthly Premium Plan</h2>
          <p className={styles.price}>€40/month</p>
          <ul className={styles.features}>
            <li>100+ mock interviews</li>
            <li>Real time interview insights</li>
            <li>AI powered performance reviews</li>
            <li>Direct access to professionals</li>
          </ul>
        </div>

        {/* Subscription status - if it's active */}
        {subscription && subscription.status === "active" && (
          <div className={styles.currentSubscription}>
            <h2>Your Subscription</h2>
            <p>
              Status: <span className={styles.status}>Active</span>
            </p>
            {subscription.current_period_end && (
              <p>
                Current period ends:{" "}
                {formatDate(subscription.current_period_end)}
              </p>
            )}
            <button
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={loading}
            >
              {subscription.cancel_at_period_end
                ? "Subscription will end at period end"
                : "Cancel Subscription"}
            </button>
          </div>
        )}

        {/* Show form unless subscription is active */}
        {(!subscription || subscription.status !== "active") && (
          <Elements stripe={stripePromise} options={{ appearance }}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
