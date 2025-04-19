import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/ProfilePage.module.css";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
// API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://casepreparedcrud.onrender.com";

// Updated interface to match actual API response
interface SubscriptionDetails {
  id?: string;
  plan?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  stripe_subscription_id?: string | null;
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

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

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
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
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

  // Format next payment date
  const formatNextPaymentDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    // Use subscription.next_payment_date if available, otherwise calculate 30 days from creation date
    if (subscription?.next_payment_date) return subscription.next_payment_date;

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

        {isPremiumMember() && (
          <div className={styles.premiumMemberCard}>
            <div>
              <div className={styles.premiumMemberText}>Premium Member</div>
              {getNextPaymentDate() && (
                <div className={styles.nextPaymentDate}>
                  Next payment: {formatNextPaymentDate(getNextPaymentDate()!)}
                </div>
              )}
            </div>
            <Link to="/subscription" className={styles.viewDetails}>
              View details
            </Link>
          </div>
        )}

        {!isPremiumMember() && (
          <div className={styles.subscribeCard}>
            <p>Get access to all premium features</p>
            <Link to="/subscription" className={styles.subscribeButton}>
              Subscribe Now
            </Link>
          </div>
        )}

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
