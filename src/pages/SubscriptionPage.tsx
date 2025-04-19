import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SubscriptionPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Just redirect to the profile page, where subscription management is now handled
  return isAuthenticated ? (
    <Navigate to="/profile" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default SubscriptionPage;
