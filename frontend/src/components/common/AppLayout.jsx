import React from "react";
import Topbar from "./Topbar";
import { useLocation } from "react-router-dom";

const HIDE_TOPBAR_PATHS = ["/login", "/register", "/forgot-password"];

const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideTopbar = HIDE_TOPBAR_PATHS.includes(location.pathname);
  return (
    <>
      {!hideTopbar && <Topbar />}
      <div>{children}</div>
    </>
  );
};

export default AppLayout;
