import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import { StripeProvider } from "./contexts/StripeContext";
import AppRoutes from "./routes";
import ScrollToTop from "./components/common/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Extend Window interface to include React DevTools hook
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers: Map<any, any>;
      [key: string]: any;
    };
  }
}

// Disable React DevTools in production for better security and performance
const disableReactDevTools = () => {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined") {
    for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (prop === "renderers") {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
      } else {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] =
          typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === "function"
            ? () => {}
            : null;
      }
    }
  }
};

// Process authentication tokens from URL parameters
const processAuthTokens = () => {
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const ref = params.get("ref");
  const priceId = params.get("price_id");
  const isOneTime = params.get("is_one_time") === "true";
  const plan = params.get("plan");

  // If we have an access token, store it and clean up URL
  if (accessToken) {
    console.log("Processing authentication token from URL parameters");

    try {
      // Store the token
      localStorage.setItem("access_token", accessToken);
      console.log("Token stored successfully");

      // Clean up URL parameters for security
      const cleanUrl = window.location.pathname;

      // If we have pricing parameters, redirect to checkout
      if (priceId && plan) {
        console.log("Pricing parameters detected, redirecting to checkout");
        const checkoutParams = new URLSearchParams();
        checkoutParams.append("price_id", priceId);
        checkoutParams.append("plan", plan);
        if (isOneTime) {
          checkoutParams.append("is_one_time", "true");
        }

        // Replace current URL with clean checkout URL
        window.history.replaceState(
          {},
          document.title,
          `${cleanUrl}checkout?${checkoutParams.toString()}`
        );
      } else {
        // Just clean up the URL without parameters
        console.log("Cleaning URL parameters");
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // Log the source of the redirect for debugging
      if (ref) {
        console.log(`Auth token received from: ${ref}`);
      }

      return true;
    } catch (error) {
      console.error("Error processing auth token:", error);
      return false;
    }
  }

  return false;
};

const App = () => {
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Process tokens before rendering the app
  useEffect(() => {
    // Disable React DevTools in production
    if (process.env.NODE_ENV === "production") {
      disableReactDevTools();
    }

    // Process authentication tokens on initial load
    const hasToken = processAuthTokens();
    setTokenProcessed(true);

    // Short delay to ensure token is fully processed
    setTimeout(() => {
      setInitializing(false);
    }, 300);
  }, []);

  // Show loading spinner while processing token
  if (initializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthProvider>
      <ModalProvider>
        <StripeProvider>
          <Router>
            <Analytics />
            <ScrollToTop />
            <AppRoutes />
          </Router>
        </StripeProvider>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
