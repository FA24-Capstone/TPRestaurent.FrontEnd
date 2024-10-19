import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import ChatButton from "../../components/chat/ChatButton";

const CommonLayout = () => {
  return (
    <>
      <Navbar />
      <ChatButton />
      <Outlet />
      <Footer />
    </>
  );
};
export default CommonLayout;
