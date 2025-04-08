import React from "react";
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
import Navbar from "./components/Navbar";
import RealtimeConnect from "./components/call/RealtimeConnect";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import AuthModal from "./components/auth/AuthModal";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import { Analytics } from "@vercel/analytics/react";
import Pricing from "./pages/Pricing";

// NavbarWrapper component to conditionally render the Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  const isInterviewSession = location.pathname.includes("/interview/session/");

  // Don't show navbar on RealtimeConnect pages
  if (isInterviewSession) return null;

  return <Navbar />;
};

const App = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <div>
            <Analytics />
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
            </Routes>
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
