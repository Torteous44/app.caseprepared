import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const AuthenticatedLayout = () => {
  const location = useLocation();

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
