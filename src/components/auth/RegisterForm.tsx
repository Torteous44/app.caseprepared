import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/Modal.module.css";

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [formError, setFormError] = useState("");
  const { register, loading } = useAuth();
  const { openModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!email || !password || !fullName) {
      setFormError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    try {
      await register(email, password, fullName);
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
          minLength={6}
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
