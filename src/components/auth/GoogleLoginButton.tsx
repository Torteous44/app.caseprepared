import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/Modal.module.css";

// Hardcoded client ID as a fallback
const GOOGLE_CLIENT_ID =
  "607050121369-r0ntm51ksokt8k92an2u3g4peu24tplg.apps.googleusercontent.com";

// Google OAuth 2.0 configuration
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const SCOPE = "email profile";

// Determine the app domain to redirect to
const APP_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://app.caseprepared.com";

interface GoogleLoginButtonProps {
  setFormError: (error: string) => void;
  mode: "signin" | "signup";
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  setFormError,
  mode,
}) => {
  const { googleLogin } = useAuth();
  const { closeModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for authorization code in URL when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (code) {
      handleGoogleCallback(code);
    } else if (error) {
      setFormError(`Google authentication error: ${error}`);
    }
  }, []);

  const handleGoogleCallback = async (code: string) => {
    setIsProcessing(true);
    try {
      await googleLogin(code);
      closeModal();

      // Redirect to the app domain after successful login
      window.location.href = APP_DOMAIN;

      // Clean up the URL to remove the authorization code
      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateGoogleLogin = () => {
    // Use client ID from environment or fallback
    const googleClientId =
      process.env.REACT_APP_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setFormError("Google authentication configuration error");
      return;
    }

    // Build the Google OAuth URL
    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.append("client_id", googleClientId);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", SCOPE);
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");

    // Add state parameter for security (can include mode info and app domain)
    const state = JSON.stringify({
      mode,
      appDomain: APP_DOMAIN,
    });
    authUrl.searchParams.append("state", state);

    // Redirect to Google's OAuth page
    window.location.href = authUrl.toString();
  };

  return (
    <div className={styles.googleButtonContainer}>
      <button
        type="button"
        className={styles.googleButton}
        onClick={initiateGoogleLogin}
        disabled={isProcessing}
      >
        <img
          src="/assets/google-logo.svg"
          alt="Google"
          className={styles.googleLogo}
        />
        <span>
          {isProcessing
            ? "Processing..."
            : mode === "signin"
            ? "Sign in with Google"
            : "Sign up with Google"}
        </span>
      </button>
      <div className={styles.orDivider}>
        <span>or</span>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
