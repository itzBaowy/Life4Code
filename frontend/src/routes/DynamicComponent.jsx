import React from "react";
import { useParams } from "react-router-dom";
import AdminPage from "../pages/Admin/AdminPage";
import UserPage from "../pages/User/UserPage";

const DynamicComponent = ({ routeId }) => {
  const { role } = useParams();

  if (routeId === "dashboard") {
    return role?.toLowerCase() === "admin" ? <AdminPage /> : <UserPage />;
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
      Tinh nang {routeId} dang duoc phat trien.
    </div>
  );
};

export default DynamicComponent;
