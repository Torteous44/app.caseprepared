import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/SubscriptionPage.module.css";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// Stripe checkout URL
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/7sI6pOgxc6Dq12M5kk";

// Debug helper - Keep this but don't show debug UI
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEBUG] ${message}`, data);
  }
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

        {/* Show subscription button unless subscription is active */}
        {(!subscription || subscription.status !== "active") && (
          <div className={styles.subscribeContainer}>
            <a 
              href={STRIPE_CHECKOUT_URL} 
              className={styles.subscribeButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe Now
            </a>
          </div>
        )}

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
