import React, { useState, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
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
  const { fetchUserProfile, handleGoogleOAuth } = useAuth();

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        setError(null);
        await handleGoogleOAuth(response.code);
      } catch (err) {
        console.error('Google authentication failed:', err);
        setError(err instanceof Error ? err.message : 'Google authentication failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.error('Google Sign-In failed');
      setError('Google authentication was cancelled or failed');
    },
    flow: 'auth-code',
    scope: 'email profile openid',
    ux_mode: 'popup',
  });

  const handleGoogleLogin = () => {
    if (loading) return;
    googleLogin();
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div style={{ width: '100%' }}>
          <h2 className={styles.signInTitle}>{isLogin ? "Sign in" : "Sign up"}</h2>
          
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
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>
          
          <div className={styles.divider}>OR</div>
          
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
              {loading ? <LoadingSpinner /> : isLogin ? "Sign in" : "Sign up"}
            </button>
          </form>
          
          <div className={styles.footer}>
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className={styles.linkButton}
                onClick={toggleAuthMode}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
          <img src="/logoauth.svg" alt="Case Prepared" className={styles.logo} />
        </div>
        
        <div className={styles.mainContent}>
          <h2>Land your dream role in consulting through AI practice interviews.</h2>
        </div>
        
        <div className={styles.bottomContent}>
          <p className={styles.partnerText}>A 24/7 case interview partner to land your dream role.</p>
        </div>
        
        <div className={styles.taglineBox}>
          AI practice interviews to help you crack the case.
        </div>
      </div>
    </div>
  );
};

export default AuthScreen; 