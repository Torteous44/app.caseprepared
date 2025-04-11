import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/ProfilePage.module.css";

interface FormState {
  full_name: string;
  email: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
    }
  }, [user]);

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
      <div className={styles.container}>
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
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
          <div className={styles.profileInfo}>
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
                Your profile has been updated successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
