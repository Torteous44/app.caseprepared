import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/common/Navbar";
import AuthScreen from "../components/auth/AuthScreen";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AuthenticatedLayout = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
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

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Hide navbar only for active interview sessions, not post-question screens
  const isInterviewSession = location.pathname.includes("/interview/session/");

  return (
    <>
      {!isInterviewSession && <Navbar />}
      <Outlet />
    </>
  );
};

export default AuthenticatedLayout;
