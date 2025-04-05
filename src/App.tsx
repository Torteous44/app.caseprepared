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
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <LandingPage />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <AboutPage />
              </>
            }
          />
          <Route
            path="/interviews"
            element={
              <>
                <Navbar />
                <InterviewsPage />
              </>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <>
                <Navbar />
                <InterviewPage />
              </>
            }
          />
          <Route
            path="/interview/session/:sessionId"
            element={<RealtimeConnect />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
