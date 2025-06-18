import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "../../styles/OAuthCallback.module.css";

const GoogleOAuthCallback: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Determine the app domain to redirect to
  const APP_DOMAIN =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://app.caseprepared.com";

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const errorParam = urlParams.get("error");

        // Handle error from Google OAuth
        if (errorParam) {
          throw new Error(`Google authentication error: ${errorParam}`);
        }

        // Handle missing code
        if (!code) {
          throw new Error("No authorization code received from Google");
        }

        // Process the authorization code
        await googleLogin(code);

        // Redirect to the app domain after successful login
        window.location.href = APP_DOMAIN;
      } catch (err) {
        console.error("Error processing Google OAuth callback:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        // Redirect to login page after a delay if there's an error
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [googleLogin, navigate, APP_DOMAIN]);

  if (error) {
    return (
      <div className={styles["oauth-callback-container"]}>
        <div className={styles["oauth-callback-error"]}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting you back to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["oauth-callback-container"]}>
      <div className={styles["oauth-callback-loading"]}>
        <LoadingSpinner />
        <p>Processing your login, please wait...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
