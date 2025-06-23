import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "./AuthScreen.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";

// Determine the marketing site domain for Google OAuth
const MARKETING_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://caseprepared.com";

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchUserProfile } = useAuth();

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/signup";
      const body = isLogin
        ? new URLSearchParams({
            username: email,
            password: password,
          })
        : JSON.stringify({
            email,
            password,
            full_name: fullName,
          });

      const headers = isLogin
        ? {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        : {
            "Content-Type": "application/json",
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      // Fetch user profile
      await fetchUserProfile();
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to marketing site for Google OAuth
    window.location.href = `${MARKETING_DOMAIN}/login?redirect=app`;
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <img
          src="/assets/Logo.avif"
          alt="CasePrepared"
          className={styles.logo}
        />
        <h1 className={styles.title}>Welcome to CasePrepared</h1>
        <p className={styles.subtitle}>
          Your AI-powered case interview preparation platform
        </p>

        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${!isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={5}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={loading}
        >
          <img
            src="/assets/google-logo.svg"
            alt="Google"
            className={styles.googleIcon}
          />
          Continue with Google
        </button>

        <div className={styles.footer}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className={styles.linkButton}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen; 