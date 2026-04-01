import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/common/Topbar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Topbar />
      <section className="mx-auto max-w-5xl p-4 md:p-6">
        <Outlet />
      </section>
    </div>
  );
};

export default UserLayout;
