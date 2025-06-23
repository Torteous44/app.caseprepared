import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "https://caseprepcrud.onrender.com";

const AuthHandler: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to handle authentication
    const handleAuthentication = async () => {
      try {
        // Extract tokens and other parameters from URL
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const ref = params.get("ref");
        const priceId = params.get("price_id");
        const isOneTime = params.get("is_one_time") === "true";
        const plan = params.get("plan");

        // If no token is present, don't proceed
        if (!accessToken) {
          return;
        }

        setIsProcessing(true);

        // Store the token
        localStorage.setItem("access_token", accessToken);

        // Validate the token by fetching user data
        try {
          // First clean up URL parameters for security
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Fetch user data using the token
          await validateToken(accessToken);

          // Fetch user profile using the context method
          await fetchUserProfile();

          // If price_id and plan are present, redirect to checkout
          if (priceId && plan) {
            navigate(
              `/checkout?price_id=${priceId}&plan=${plan}${
                isOneTime ? "&is_one_time=true" : ""
              }`,
              { replace: true }
            );
          } else {
            // Otherwise redirect to interviews page
            navigate("/interviews", { replace: true });
          }
        } catch (validationError) {
          console.error("Token validation error:", validationError);
          handleAuthError("Invalid authentication token");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        handleAuthError(
          err instanceof Error ? err.message : "Authentication failed"
        );
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthentication();
  }, [navigate, fetchUserProfile]);

  // Function to validate token by fetching user data
  const validateToken = async (token: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to validate token");
    }

    const userData = await response.json();
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  // Function to handle authentication errors
  const handleAuthError = (message: string) => {
    // Log the error
    console.error("Authentication error:", message);

    // Clear any partial authentication state
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Set error state
    setError(message);

    // Redirect to home page
    navigate("/", { replace: true });
  };

  return (
    <div
      className="auth-handler-container"
      style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {isProcessing ? (
        <div>
          <h2>Authenticating...</h2>
          <p>Please wait while we log you in.</p>
          <div
            style={{
              margin: "20px auto",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : error ? (
        <div>
          <h2>Authentication Error</h2>
          <p style={{ color: "#b91c1c" }}>{error}</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Return to Home
          </button>
        </div>
      ) : (
        <div>
          <h2>Authentication Handler</h2>
          <p>This page handles authentication from the main site.</p>
        </div>
      )}
    </div>
  );
};

export default AuthHandler;
