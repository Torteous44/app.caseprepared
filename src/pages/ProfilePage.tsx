import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/ProfilePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import axios from "axios";

// API base URL
const API_BASE_URL = "http://localhost:8000";
// Lock Icon SVG as component
const LockIcon = () => (
  <svg
    className={styles.securityIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// CheckCircle Icon for features
const CheckCircle = ({ size = 18, stroke = "#004494" }) => (
  <svg
    className={styles.featureIcon}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Arrow component for CTA buttons
const ArrowIcon = () => <span className={styles.ctaArrow}>→</span>;

// Updated interface to match actual API response
interface SubscriptionDetails {
  id?: string;
  plan?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  stripe_subscription_id?: string | null;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  next_payment_date?: string;
}

interface SubscriptionStatus {
  is_active: boolean;
  details: SubscriptionDetails;
}

// Extend the User type to include subscription
interface ExtendedUser {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
  subscription?: SubscriptionStatus;
}

// Checkout Button Component
const CheckoutButton = ({
  priceId,
  className,
}: {
  priceId: string;
  className?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
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

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || styles.subscribeButton}
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <ArrowIcon /> Subscribe Now
          </>
        )}
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cast user to ExtendedUser to access subscription property
  const extendedUser = user as ExtendedUser;

  useEffect(() => {
    if (user) {
      // If user object already has subscription data, use it
      if (extendedUser.subscription?.details) {
        setSubscription(extendedUser.subscription.details);
      } else {
        fetchSubscription();
      }
    }
  }, [user, extendedUser]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        if (Array.isArray(data) && data.length > 0) {
          setSubscription(data[0]);
        } else if (data.subscription?.details) {
          // Handle nested subscription structure
          setSubscription(data.subscription.details);
        } else if (data.details) {
          // Handle subscription object with details
          setSubscription(data.details);
        } else {
          // Direct subscription data
          setSubscription(data);
        }
      } else {
        console.error("Failed to fetch subscription:", response.statusText);
        setError(`Failed to fetch subscription: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(
        `Error fetching subscription: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setCancelLoading(true);
    setMessage("");
    setError(null);

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
      setError(
        `Cancellation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <h1>Profile not available</h1>
          <p>Please sign in to view your profile information.</p>
        </div>
      </div>
    );
  }

  // Extract user creation date
  const formatMemberSince = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleString("default", {
      month: "long",
    })} ${date.getFullYear()}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    // Check if the date is a unix timestamp (seconds) or an ISO date string
    if (/^\d+$/.test(dateString)) {
      return new Date(parseInt(dateString) * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      // Handle ISO format date string
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const isPremiumMember = () => {
    // Check if user has a subscription property with is_active true
    if (extendedUser.subscription?.is_active) return true;

    // Or check the subscription state directly
    return (
      subscription?.status === "active" &&
      subscription?.plan === "price_1RClmJIhI9uxpDni996tXg6s"
    );
  };

  const getNextPaymentDate = () => {
    // Use subscription.next_payment_date or current_period_end if available
    if (subscription?.next_payment_date) return subscription.next_payment_date;
    if (subscription?.current_period_end)
      return subscription.current_period_end;

    if (subscription?.created_at) {
      // Add 30 days to creation date as an estimate if no next_payment_date is provided
      const creationDate = new Date(subscription.created_at);
      const nextPaymentDate = new Date(creationDate);
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
      return nextPaymentDate.toISOString();
    }

    return null;
  };

  return (
    <>
      <div className={styles.container}>
        <header className={styles.profileHeader}>
          <div>
            <h1>{extendedUser.full_name || "User"}</h1>
            <p className={styles.memberSince}>
              Member since {formatMemberSince(extendedUser.created_at)}
            </p>
          </div>
          {isPremiumMember() && (
            <span className={styles.premiumBadge}>Premium</span>
          )}
        </header>

        <div className={styles.profileInfo}>
          <div className={styles.infoField}>
            <label>Name</label>
            <div className={styles.infoDisplay}>
              {extendedUser.full_name || ""}
            </div>
          </div>

          <div className={styles.infoField}>
            <label>Email</label>
            <div className={styles.infoDisplay}>{extendedUser.email || ""}</div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className={styles.subscriptionSection}>
          <h2 className={styles.sectionTitle}>Subscription</h2>

          {subscriptionLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading subscription details...</p>
            </div>
          ) : isPremiumMember() ? (
            <>
              <div className={styles.premiumMemberCard}>
                <div>
                  <div className={styles.premiumMemberText}>Premium Member</div>
                  {getNextPaymentDate() && (
                    <div className={styles.nextPaymentDate}>
                      Next payment: {formatDate(getNextPaymentDate()!)}
                    </div>
                  )}
                </div>

                <div className={styles.subscriptionStatus}>
                  <div className={styles.statusIndicator}>
                    <div className={styles.activeIcon}></div>
                    <span>Active Subscription</span>
                  </div>
                </div>
              </div>

              {subscription?.cancel_at_period_end ? (
                <div className={styles.cancelInfo}>
                  <p>
                    Your subscription will end on{" "}
                    {formatDate(subscription.current_period_end)}. You will not
                    be charged again.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Processing..." : "Cancel subscription"}
                </button>
              )}

              {message && <div className={styles.message}>{message}</div>}
            </>
          ) : (
            <>
              <div className={styles.planDetails}>
                <h3 className={styles.planTitle}>Premium Plan Features</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>39.99</span>
                  <span className={styles.period}>/month</span>
                </div>

                <ul className={styles.features}>
                  <li>
                    <CheckCircle size={22} />{" "}
                    <span>
                      <strong>100+ mock interviews</strong> trained on official
                      MBB data
                    </span>
                  </li>
                  <li>
                    <CheckCircle size={22} />{" "}
                    <span>
                      <strong>Realtime personalized AI feedback</strong> that
                      adapts to your strengths and weaknesses
                    </span>
                  </li>
                  <li>
                    <CheckCircle size={22} />{" "}
                    <span>
                      <strong>Case partner</strong> that never gets tired and is
                      completely informed
                    </span>
                  </li>
                  <li>
                    <CheckCircle size={22} />{" "}
                    <span>
                      <strong>Detailed analysis</strong> giving you the best
                      practice for your next interview
                    </span>
                  </li>
                  <li>
                    <CheckCircle size={22} />{" "}
                    <span>
                      <strong>24/7 access</strong> to practice at your own pace
                    </span>
                  </li>
                </ul>

                <div className={styles.checkoutContainer}>
                  <CheckoutButton
                    priceId="price_1RClmJIhI9uxpDni996tXg6s"
                    className={styles.subscribeButton}
                  />
                  <p className={styles.guaranteeText}>
                    30-day money-back guarantee • Cancel anytime
                  </p>
                </div>
              </div>
            </>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.actionButtons}>
          <Link to="/interviews" className={styles.interviewsButton}>
            Interviews
          </Link>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sign out
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
