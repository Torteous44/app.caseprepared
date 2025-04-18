import React, { useLayoutEffect, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/landingPage";
import AboutPage from "./pages/AboutPage";
import InterviewsPage from "./pages/InterviewsPage";
import AuthenticatedInterviewsPage from "./pages/AuthenticatedInterviewsPage";
import InterviewPage from "./pages/InterviewPage";
import AuthenticatedInterviewPage from "./pages/AuthenticatedInterviewPage";
import PostQuestionScreen from "./components/interview/PostQuestionScreen";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Navbar from "./components/common/Navbar";

import AuthenticatedRealtimeConnect from "./components/call/AuthenticatedRealtimeConnect";
import DemoRealtimeConnect from "./components/call/DemoRealtimeConnect";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import { StripeProvider } from "./contexts/StripeContext";
import AuthModal from "./components/auth/AuthModal";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import { Analytics } from "@vercel/analytics/react";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Loading component with proper styling
const LoadingSpinner = () => {
  const [dots, setDots] = React.useState(1);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      Loading{".".repeat(dots)}
    </div>
  );
};

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

// Protected route for subscription page
const ProtectedSubscriptionRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <SubscriptionPage /> : <Navigate to="/pricing" />;
};

// Conditional route component that checks authentication status
const InterviewsRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth status to be determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <AuthenticatedInterviewsPage /> : <InterviewsPage />;
};

// Protected route for authenticated interview page
const ProtectedInterviewRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth status to be determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <AuthenticatedInterviewPage />
  ) : (
    <Navigate to="/interviews" />
  );
};

// Protected route for authenticated realtime session
const ProtectedRealtimeSessionRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth status to be determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <AuthenticatedRealtimeConnect />
  ) : (
    <Navigate to="/interviews" />
  );
};

// Protected route for post-question screen
const ProtectedPostQuestionRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth status to be determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <PostQuestionScreen />
  ) : (
    <Navigate to="/interviews" />
  );
};

// Protected route for landing page - redirects authenticated users
const ProtectedLandingRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth status to be determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/interviews" /> : <LandingPage />;
};

// Protected route components for pages that redirect authenticated users to interviews
const ProtectedAboutRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/interviews" /> : <AboutPage />;
};

const ProtectedPricingRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/interviews" /> : <Pricing />;
};

const ProtectedResourcesRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/interviews" /> : <Resources />;
};

// ScrollToTop component to handle scrolling to top on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// NavbarWrapper component to conditionally render the Navbar
const NavbarWrapper = () => {
  const location = useLocation();

  // Check for all interview session paths, both authenticated and non-authenticated
  const isInterviewSession =
    location.pathname.includes("/interview/session/") ||
    location.pathname.includes("/interview/authenticated-session/") ||
    location.pathname.includes("/interview/demo-session/");

  const isPostQuestionScreen = location.pathname.includes(
    "/interview/post-question/"
  );

  // Log path for debugging
  console.log(`Current path: ${location.pathname}`, {
    isInterviewSession,
    isPostQuestionScreen,
    hideNavbar: isInterviewSession,
  });

  // Only hide navbar on interview sessions, but show on post-question screens
  if (isInterviewSession) return null;

  return <Navbar />;
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
            <div>
              <Analytics />
              <ScrollToTop />
              <NavbarWrapper />
              <AuthModal />
              <Routes>
                <Route path="/" element={<ProtectedLandingRoute />} />
                <Route path="/about" element={<ProtectedAboutRoute />} />
                <Route path="/interviews" element={<InterviewsRoute />} />
                <Route path="/interview/:id" element={<InterviewPage />} />
                <Route
                  path="/my-interview/:id"
                  element={<ProtectedInterviewRoute />}
                />
                <Route
                  path="/interview/session/:sessionId"
                  element={<DemoRealtimeConnect />}
                />
                <Route
                  path="/interview/demo-session/:demoTypeId"
                  element={<DemoRealtimeConnect />}
                />
                <Route
                  path="/interview/authenticated-session/:sessionId"
                  element={<ProtectedRealtimeSessionRoute />}
                />
                <Route
                  path="/interview/post-question/:interviewId"
                  element={<ProtectedPostQuestionRoute />}
                />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/pricing" element={<ProtectedPricingRoute />} />
                <Route
                  path="/subscription"
                  element={<ProtectedSubscriptionRoute />}
                />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route
                  path="/resources"
                  element={<ProtectedResourcesRoute />}
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </StripeProvider>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
