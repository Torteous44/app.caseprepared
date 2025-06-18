import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/ProfilePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import axios from "axios";

// API base URL
const API_BASE_URL = "http://127.0.0.1:8000";

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

// Updated interface to match API documentation
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

// Extend the User type to include subscription and match API documentation
interface ExtendedUser {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  subscription?: SubscriptionStatus;
  subscription_status?: string; // From token payload
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
        {loading ? "Processing..." : "Join today"}
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

// Subscription Card component
const SubscriptionCard = () => {
  return (
    <div className={styles.subscriptionCard}>
      <div className={styles.subscriptionContent}>
        <div className={styles.subscriptionHeader}>
          <div className={styles.brandName}>CasePrepared</div>
          <div className={styles.premiumTag}>Premium</div>
        </div>

        <div className={styles.pricingContainer}>
          <div className={styles.price}>
            <span className={styles.dollarSign}>$</span>
            <span className={styles.priceAmount}>19.99</span>
            <span className={styles.currency}>USD</span>
          </div>
          <div className={styles.pricePeriod}>Price per month</div>
        </div>
      </div>

      <div className={styles.decorativeImage}>
        <img src="/assets/image 11.svg" alt="Decorative pattern" />
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  // Cast user to ExtendedUser to access subscription property
  const extendedUser = user as ExtendedUser;

  useEffect(() => {
    if (user) {
      // Initialize form data with current user info
      setFormData({
        full_name: extendedUser.full_name || "",
        email: extendedUser.email,
      });

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
    navigate("/");
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      setCancelLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) return;

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

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        setMessage(
          "Your subscription has been canceled. You'll have access until the end of your billing period."
        );
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail || "Failed to cancel subscription. Please try again."
        );
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      setError(
        `Error canceling subscription: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      // Only update fields that have changed
      const updateData: { full_name?: string } = {};
      if (formData.full_name !== extendedUser.full_name) {
        updateData.full_name = formData.full_name;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserProfile(updateData);
        setMessage("Profile updated successfully");
      }
      setEditMode(false);
    } catch (err) {
      setError(
        `Failed to update profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const isPremiumMember = () => {
    if (extendedUser.subscription?.is_active) return true;
    if (extendedUser.subscription_status === "active") return true;
    if (subscription?.status === "active") return true;
    return false;
  };

  const getNextPaymentDate = () => {
    if (subscription?.current_period_end) {
      return formatDate(subscription.current_period_end);
    }
    if (subscription?.next_payment_date) {
      return formatDate(subscription.next_payment_date);
    }
    return "N/A";
  };

  if (!user) {
    return <div className={styles.loading}>Loading user profile...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Profile</h1>
        <p className={styles.memberSince}>
          Member since {formatMemberSince(extendedUser.created_at)}
        </p>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h2>Account Information</h2>
            {!editMode && (
              <button
                className={styles.editButton}
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className={`${styles.formInput} ${styles.disabled}`}
                />
                <small>Email cannot be changed</small>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      full_name: extendedUser.full_name || "",
                      email: extendedUser.email,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Name:</span>
                <span className={styles.infoValue}>
                  {extendedUser.full_name || "Not provided"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{extendedUser.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Account Status:</span>
                <span className={styles.infoValue}>
                  {extendedUser.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>
              {extendedUser.is_admin && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Admin Status:</span>
                  <span className={styles.infoValue}>Administrator</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.profileSection}>
          <h2>Subscription</h2>
          {subscriptionLoading ? (
            <div className={styles.loading}>
              Loading subscription details...
            </div>
          ) : isPremiumMember() ? (
            <div className={styles.subscriptionInfo}>
              <SubscriptionCard />
              <div className={styles.subscriptionDetails}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Status:</span>
                  <span className={`${styles.infoValue} ${styles.active}`}>
                    Active
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Plan:</span>
                  <span className={styles.infoValue}>
                    {subscription?.plan || "Premium"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Next Payment:</span>
                  <span className={styles.infoValue}>
                    {getNextPaymentDate()}
                  </span>
                </div>
                {subscription?.cancel_at_period_end && (
                  <div className={styles.cancelNotice}>
                    Your subscription will end on{" "}
                    {formatDate(subscription.current_period_end)}
                  </div>
                )}
                {!subscription?.cancel_at_period_end && (
                  <button
                    className={styles.cancelSubscriptionButton}
                    onClick={handleCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? "Processing..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.noSubscription}>
              <p>You don't have an active subscription.</p>
              <CheckoutButton
                priceId="price_1PJPcmIzbD323IQGTmzuFcNj"
                className={styles.subscribeButton}
              />
            </div>
          )}
        </div>

        <div className={styles.profileSection}>
          <h2>Security</h2>
          <div className={styles.securityOptions}>
            <div className={styles.securityOption}>
              <div className={styles.securityOptionHeader}>
                <LockIcon />
                <h3>Sign Out</h3>
              </div>
              <p>Sign out from your account on this device</p>
              <button className={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <Footer />
    </div>
  );
};

export default ProfilePage;
