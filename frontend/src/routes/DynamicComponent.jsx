import React from "react";
import { useParams } from "react-router-dom";
import AdminPage from "../pages/Admin/AdminPage";
import CourseManagementPage from "../pages/Admin/CourseManagementPage";
import MyCoursesPage from "../pages/User/MyCoursesPage";
import UserPage from "../pages/User/UserPage";

const DynamicComponent = ({ routeId }) => {
  const { role } = useParams();

  if (routeId === "dashboard") {
    return role?.toLowerCase() === "admin" ? <AdminPage /> : <UserPage />;
  }

  if (routeId === "course-management") {
    return role?.toLowerCase() === "admin" ? (
      <CourseManagementPage />
    ) : (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        Bạn không có quyền truy cập vào trang này.
      </div>
    );
  }

  if (routeId === "my-courses") {
    return role?.toLowerCase() !== "admin" ? (
      <MyCoursesPage />
    ) : (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        Bạn không có quyền truy cập vào trang này.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
      Tinh nang {routeId} dang duoc phat trien.
    </div>
  );
};

export default DynamicComponent;
