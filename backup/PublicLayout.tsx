import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import AuthModal from "../components/auth/AuthModal";

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <AuthModal />
      <Outlet />
    </>
  );
};

export default PublicLayout;
