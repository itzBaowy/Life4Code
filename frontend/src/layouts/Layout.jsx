import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/common/Topbar";
import Sidebar from "../components/common/Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100">
      <Topbar />
      <Sidebar />
      <div className="md:ml-64">
        <main className="min-h-screen bg-[#0a0d16] pt-20 px-4 pb-4 md:px-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
