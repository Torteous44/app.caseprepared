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

// User interface matching API documentation
interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  subscription_status?: string; // From token payload: "none" | "trialing" | "active" | "past_due" | "canceled"
}

// Checkout Button Component
const CheckoutButton = ({
  plan,
  className,
}: {
  plan: string;
  className?: string;
}) => {
  const navigate = useNavigate();
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

      // Call backend endpoint to create checkout session - Updated to match API docs
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/billing/checkout`,
        {
          plan: plan,
          success_url: `${window.location.origin}/checkout/success`,
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
        onClick={() => navigate('/pricing')}
        className={className || styles.subscribeButton}
      >
        Join today
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};


const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  // Fetch complete user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Use the documented API endpoint for profile data
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          full_name: data.full_name || "",
          email: data.email,
        });
      } else {
        console.error("Failed to fetch profile:", response.statusText);
        setError(`Failed to fetch profile: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(
        `Error fetching profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Use the documented billing portal endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/v1/billing/portal?return_url=${encodeURIComponent(window.location.href)}`,
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
        // Redirect to Stripe billing portal
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail || "Failed to access billing portal. Please try again."
        );
      }
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      setError(
        `Error accessing billing portal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPortalLoading(false);
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
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Only update fields that have changed
      const updateData: { full_name?: string } = {};
      if (formData.full_name !== profileData?.full_name) {
        updateData.full_name = formData.full_name;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setProfileData(updatedUser);
          setMessage("Profile updated successfully");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to update profile");
        }
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

  const isPremiumMember = () => {
    return profileData?.subscription_status === "active" || profileData?.subscription_status === "trialing";
  };

  // Show loading state while fetching profile data
  if (profileLoading || !profileData) {
    return <div className={styles.loading}>Loading user profile...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Profile</h1>
        <p className={styles.memberSince}>
          Member since {formatMemberSince(profileData.created_at)}
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
                      full_name: profileData.full_name || "",
                      email: profileData.email,
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
                  {profileData.full_name || "Not provided"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{profileData.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Account Status:</span>
                <span className={styles.infoValue}>
                  {profileData.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>
              {profileData.is_admin && (
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
          {isPremiumMember() ? (
            <div className={styles.subscriptionInfo}>
              <div className={styles.subscriptionDetails}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Status:</span>
                  <span className={`${styles.infoValue} ${styles.active}`}>
                    {profileData.subscription_status === "trialing" ? "Trial" : "Active"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Plan:</span>
                  <span className={styles.infoValue}>Premium</span>
                </div>
                {profileData.subscription_status !== "trialing" && (
                  <button
                    className={styles.manageSubscriptionButton}
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                  >
                    {portalLoading ? "Loading..." : "Manage Subscription"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.noSubscription}>
              <p>You don't have an active subscription.</p>
              <CheckoutButton
                plan="monthly"
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
