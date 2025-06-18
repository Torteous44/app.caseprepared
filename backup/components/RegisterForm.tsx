import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/Modal.module.css";
import GoogleLoginButton from "./GoogleLoginButton";

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [formError, setFormError] = useState("");
  const { register, loading } = useAuth();
  const { openModal, closeModal } = useModal();

  const validatePassword = (password: string): string | null => {
    if (password.length < 5) {
      return "Password must be at least 5 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!email || !password || !fullName) {
      setFormError("Please fill in all fields");
      return;
    }

    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    try {
      await register(email, password, fullName);
      // Close the modal after successful registration
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to register. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <img
        src="/assets/Logo Text.svg"
        alt="Case Prepared"
        className={styles.logo}
      />
      <h2 className={styles.modalTitle}>Sign up to continue</h2>
      {formError && <div className={styles.error}>{formError}</div>}

      <GoogleLoginButton setFormError={setFormError} mode="signup" />

      <div className={styles.formGroup}>
        <label htmlFor="full-name" className={styles.label}>
          Full Name
        </label>
        <input
          id="full-name"
          type="text"
          className={styles.input}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
        />
      </div>

      <button type="submit" className={styles.buttonPrimary} disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <div className={styles.switchLink}>
        Already have an account?{" "}
        <button
          type="button"
          className={styles.switchButton}
          onClick={() => openModal("login")}
        >
          Log in
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
