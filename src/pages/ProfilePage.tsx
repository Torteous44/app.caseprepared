import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/ProfilePage.module.css";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
// API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://casepreparedcrud.onrender.com";

// Updated interface to match actual API response
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

interface FormState {
  full_name: string;
  email: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Debug helper
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEBUG] ${message}`, data);
  }
};

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    loading: false,
    error: null,
    success: false,
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prevState) => ({
        ...prevState,
        full_name: user.full_name || "",
        email: user.email,
      }));

      // Fetch subscription status when user is available
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      logDebug("Fetching subscription data");

      const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        logDebug("Raw subscription data:", data);

        // Handle if the response is an array (take the first element)
        const subscriptionData = Array.isArray(data) ? data[0] : data;
        logDebug("Processed subscription data:", subscriptionData);

        setSubscription(subscriptionData);
      } else {
        console.error("Failed to fetch subscription:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      error: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormData({ ...formData, loading: true, error: null, success: false });

    try {
      const dataToUpdate = {
        full_name: formData.full_name,
      };

      await updateUserProfile(dataToUpdate);
      setFormData({
        ...formData,
        loading: false,
        success: true,
      });

      // Exit edit mode after successful update
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setFormData({
        ...formData,
        loading: false,
        error: errorMessage,
      });
    }
  };

  if (!user) {
    return (
      <div className={styles.contentContainer}>
        <div className={styles.card}>
          <h1 className={styles.title}>Profile not available</h1>
          <p>Please sign in to view your profile information.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSubscriptionDate = (timestamp?: string) => {
    if (!timestamp) return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const formatRenewalDate = (timestamp?: string) => {
    if (!timestamp) return "soon";
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to get subscription status details
  const getSubscriptionDetails = () => {
    if (!subscription)
      return {
        statusDisplay: "No Subscription",
        statusClass: "inactive",
        hasPlan: false,
      };

    // Convert status to display format
    let statusDisplay = subscription.status || "Unknown";
    let statusClass = "";
    let hasPlan = false;

    switch (subscription.status) {
      case "active":
        statusDisplay = "Active";
        statusClass = "active";
        hasPlan = true;
        break;
      case "canceled":
        statusDisplay = "Canceled";
        statusClass = "canceled";
        break;
      case "past_due":
        statusDisplay = "Past Due";
        statusClass = "pastDue";
        hasPlan = true;
        break;
      case "incomplete":
        statusDisplay = "Incomplete";
        statusClass = "incomplete";
        break;
      case "trialing":
        statusDisplay = "Trial";
        statusClass = "active";
        hasPlan = true;
        break;
      case "unpaid":
        statusDisplay = "Unpaid";
        statusClass = "unpaid";
        break;
      default:
        statusDisplay = subscription.status || "Unknown";
        statusClass = "unknown";
    }

    return { statusDisplay, statusClass, hasPlan };
  };

  // Helper to check if user has premium subscription
  const isPremiumMember = () => {
    return (
      subscription?.plan === "premium" && subscription?.status === "active"
    );
  };

  const { statusDisplay, statusClass, hasPlan } = getSubscriptionDetails();

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Welcome, {user.full_name || "User"}</h1>
        {isPremiumMember() && (
          <span className={styles.premiumBadge}>Premium member</span>
        )}
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h2 className={styles.title}>Profile</h2>
              {!isEditing && (
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="full_name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className={`${styles.input} ${styles.disabled}`}
                    placeholder="Your email address"
                  />
                  <p className={styles.helperText}>
                    Email address cannot be changed
                  </p>
                </div>

                {formData.error && (
                  <div className={styles.errorMessage}>{formData.error}</div>
                )}

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        full_name: user.full_name || "",
                        error: null,
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={formData.loading}
                  >
                    {formData.loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.profileInfoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Full Name</span>
                  <span className={styles.value}>
                    {user.full_name || "Not provided"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Email Address</span>
                  <span className={styles.value}>{user.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Member Since</span>
                  <span className={styles.value}>
                    {formatDate(user.created_at)}
                  </span>
                </div>

                {formData.success && (
                  <div className={styles.successMessage}>
                    Your profile has been updated successfully.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Redesigned Subscription Banner */}
          {subscriptionLoading ? (
            <div className={styles.card}>
              <div className={styles.subscriptionLoading}>
                Loading subscription information...
              </div>
            </div>
          ) : subscription && subscription.status === "active" ? (
            <div className={styles.subscriptionBanner}>
              <div className={styles.subscriptionBannerInfo}>
                <div className={styles.premiumMemberLabel}>Premium Member</div>
              </div>
              <Link to="/subscription" className={styles.viewDetailsLink}>
                View details
              </Link>
            </div>
          ) : (
            <div className={styles.card}>
              <div className={styles.header}>
                <h2 className={styles.title}>Subscription</h2>
              </div>
              <div className={styles.noSubscription}>
                <p>You don't have an active subscription.</p>
                <Link to="/subscription" className={styles.subscribeButton}>
                  Subscribe Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
