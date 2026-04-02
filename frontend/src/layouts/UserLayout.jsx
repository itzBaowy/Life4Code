import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/common/Topbar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-slate-100">
      <Topbar />
      <section className="mx-auto max-w-5xl px-4 pb-4 pt-20 md:px-6 md:pb-6">
        <Outlet />
      </section>
    </div>
  );
};

export default UserLayout;
