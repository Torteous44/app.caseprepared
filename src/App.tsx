import React, { useLayoutEffect, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/landingPage";
import AboutPage from "./pages/AboutPage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewPage from "./pages/InterviewPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Navbar from "./components/common/Navbar";
import RealtimeConnect from "./components/call/RealtimeConnect";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import AuthModal from "./components/auth/AuthModal";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import { Analytics } from "@vercel/analytics/react";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

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
  const isInterviewSession = location.pathname.includes("/interview/session/");

  // Don't show navbar on RealtimeConnect pages
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
        <Router>
          <div>
            <Analytics />
            <ScrollToTop />
            <NavbarWrapper />
            <AuthModal />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/interview/:id" element={<InterviewPage />} />
              <Route
                path="/interview/session/:sessionId"
                element={<RealtimeConnect />}
              />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
