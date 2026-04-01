import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/common/Topbar";
import Sidebar from "../components/common/Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100">
      <Topbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex flex-1 flex-col bg-[#0a0d16]">
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
