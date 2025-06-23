import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "../../styles/OAuthCallback.module.css";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens and error from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");
        const errorParam = urlParams.get("error");

        // Handle error from OAuth
        if (errorParam) {
          throw new Error(`Authentication error: ${errorParam}`);
        }

        // Handle missing tokens
        if (!accessToken) {
          throw new Error("No access token received from authentication");
        }

        console.log("Processing authentication tokens from callback");

        // Store tokens
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken || "");

        console.log("Tokens stored successfully, redirecting to dashboard");

        // Redirect to the main app (dashboard/interviews)
        navigate("/interviews", { replace: true });
      } catch (err) {
        console.error("Error processing OAuth callback:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        // Redirect to login page after a delay if there's an error
        setTimeout(() => {
          navigate("/login", { replace: true });
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

export default AuthCallback;
