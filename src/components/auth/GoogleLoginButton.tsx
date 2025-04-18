import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import styles from "../../styles/Modal.module.css";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
    GOOGLE_CLIENT_ID: string;
  }
}

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
  const [initialized, setInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Hardcoded client ID as a fallback - same as in .env file
  const GOOGLE_CLIENT_ID =
    "607050121369-r0ntm51ksokt8k92an2u3g4peu24tplg.apps.googleusercontent.com";

  // Get the current origin for setting the correct redirect URI
  const origin = window.location.origin;

  // Alternative method using the redirect page - moved outside of other functions
  const redirectToAuthPage = () => {
    // Store client ID for use in the redirect page
    localStorage.setItem("googleClientId", GOOGLE_CLIENT_ID);
    // Navigate to the redirect page
  };

  // Check for credential from redirect flow
  useEffect(() => {
    const checkRedirectCredential = async () => {
      const credential = localStorage.getItem("googleCredential");
      if (credential) {
        try {
          console.log("Found credential from redirect flow");
          // Clear the credential before using it (to prevent reuse)
          localStorage.removeItem("googleCredential");
          // Use the credential for login
          await googleLogin(credential);
          // Close the modal after successful login
          closeModal();
        } catch (error) {
          console.error("Error using redirect credential:", error);
          if (error instanceof Error) {
            setFormError(error.message);
          } else {
            setFormError(
              "Failed to sign in with Google redirect. Please try again."
            );
          }
        }
      }
    };

    checkRedirectCredential();
  }, []);

  useEffect(() => {
    if (scriptLoaded) return;

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Identity Services script loaded");
      setScriptLoaded(true);
    };

    script.onerror = (e) => {
      console.error("Failed to load Google Identity Services script:", e);
      setFormError("Failed to load Google authentication");
    };

    document.body.appendChild(script);

    return () => {
      // Only remove the script if it exists in the document
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Sign-In once the script is loaded
  useEffect(() => {
    if (!scriptLoaded || initialized) return;

    initializeGoogleSignIn();
  }, [scriptLoaded, initialized]);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error("Google API not available");
      setFormError("Google authentication services not available");
      return;
    }

    try {
      // Use client ID from window object first, then env var, then fallback
      const googleClientId =
        window.GOOGLE_CLIENT_ID ||
        process.env.REACT_APP_GOOGLE_CLIENT_ID ||
        GOOGLE_CLIENT_ID;

      console.log("Using Google Client ID:", googleClientId);
      console.log("Current origin:", origin);

      if (!googleClientId) {
        console.error("Google Client ID is missing");
        setFormError("Google authentication configuration error");
        return;
      }

      // CORS-friendly configuration
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
        context: mode === "signin" ? "signin" : "signup",
        itp_support: true,
      });

      // Render actual styled button instead of using Google's rendered button
      setInitialized(true);
    } catch (error) {
      console.error("Google Sign-In initialization error:", error);
      setFormError("Failed to initialize Google Sign-In");
    }
  };

  const handleGoogleCallback = async (response: any) => {
    console.log("Google auth response received");

    try {
      if (!response) {
        throw new Error("Empty response from Google");
      }

      const token = response.credential;
      if (!token) {
        throw new Error("No credential received from Google");
      }

      console.log("Got credential, sending to backend");
      await googleLogin(token);
      // Close the modal after successful login
      closeModal();
    } catch (error) {
      console.error("Google login error:", error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to sign in with Google. Please try again.");
      }
    }
  };

  const handleGoogleButtonClick = () => {
    if (!scriptLoaded) {
      setFormError("Google Sign-In is still loading. Please wait a moment.");
      return;
    }

    if (window.google && window.google.accounts) {
      try {
        console.log("Prompting Google Sign-In");
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log(
              "Google Sign-In prompt not displayed:",
              notification.getNotDisplayedReason() ||
                notification.getSkippedReason()
            );

            // If Google prompt is not displayed, try the redirect approach
            redirectToAuthPage();
          }
        });
      } catch (e) {
        console.error("Error prompting Google Sign-In:", e);
        // Fall back to redirect method
        redirectToAuthPage();
      }
    } else {
      // No Google API available, try redirect method
      redirectToAuthPage();
    }
  };

  return (
    <div className={styles.googleButtonContainer}>
      <button
        type="button"
        className={styles.googleButton}
        onClick={handleGoogleButtonClick}
      >
        <img
          src="/assets/google-logo.svg"
          alt="Google"
          className={styles.googleLogo}
        />
        <span>
          {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </span>
      </button>
      <div className={styles.orDivider}>
        <span>or</span>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
