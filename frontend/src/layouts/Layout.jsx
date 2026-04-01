import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/common/Topbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
