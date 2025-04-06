import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/Modal.module.css";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, loading } = useAuth();
  const { openModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to log in. Please try again.");
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
      <h2 className={styles.modalTitle}>Log in to continue</h2>
      {formError && <div className={styles.error}>{formError}</div>}

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
        />
      </div>

      <button type="submit" className={styles.buttonPrimary} disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>

      <div className={styles.switchLink}>
        Don't have an account?{" "}
        <button
          type="button"
          className={styles.switchButton}
          onClick={() => openModal("register")}
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
