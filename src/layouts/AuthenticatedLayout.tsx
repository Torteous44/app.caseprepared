import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import AuthModal from "../components/auth/AuthModal";

const AuthenticatedLayout = () => {
  const location = useLocation();

  // Hide navbar for interview sessions
  const isInterviewSession =
    location.pathname.includes("/interview/authenticated-session/") ||
    location.pathname.includes("/interview/post-question/");

  return (
    <>
      {!isInterviewSession && <Navbar />}
      <AuthModal />
      <Outlet />
    </>
  );
};

export default AuthenticatedLayout;
