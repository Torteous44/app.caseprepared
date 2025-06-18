import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "../../styles/OAuthCallback.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";

// Determine the app domain to redirect to
const APP_DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://app.caseprepared.com";

const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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

        // Process the authorization code directly
        console.log("Sending Google authorization code to backend");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/auth/oauth/google/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        // Log full response details for debugging
        console.log("Response status:", response.status);

        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (!response.ok) {
          // Extract detailed error message if available
          let errorMessage = "Google login failed";

          if (responseData.detail) {
            errorMessage =
              typeof responseData.detail === "string"
                ? responseData.detail
                : JSON.stringify(responseData.detail);
          }

          throw new Error(errorMessage);
        }

        // Store tokens
        localStorage.setItem("access_token", responseData.access_token);
        localStorage.setItem("refresh_token", responseData.refresh_token || "");

        // Redirect to the app domain with token in URL for direct processing
        window.location.href = `${APP_DOMAIN}/?access_token=${encodeURIComponent(
          responseData.access_token
        )}&ref=google_oauth&_t=${Date.now()}`;
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
  }, [navigate]);

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
