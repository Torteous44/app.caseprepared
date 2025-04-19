import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import AuthModal from "../components/auth/AuthModal";

const AuthenticatedLayout = () => {
  const location = useLocation();

  // Hide navbar only for active interview sessions, not post-question screens
  const isInterviewSession = location.pathname.includes(
    "/interview/authenticated-session/"
  );

  return (
    <>
      {!isInterviewSession && <Navbar />}
      <AuthModal />
      <Outlet />
    </>
  );
};

export default AuthenticatedLayout;
