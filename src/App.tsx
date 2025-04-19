import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import { StripeProvider } from "./contexts/StripeContext";
import AppRoutes from "./routes";
import ScrollToTop from "./components/common/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";

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

const App = () => {
  // Disable React DevTools in production
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      disableReactDevTools();
    }
  }, []);

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
