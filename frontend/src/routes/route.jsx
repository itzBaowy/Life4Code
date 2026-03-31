import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import AdminPage from "../pages/Admin/AdminPage";
import UserPage from "../pages/User/UserPage";
import { authCookie } from "../utils/AuthCookie";
import { useParams, useLocation } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
// import RegisterPage from '../pages/Auth/RegisterPage';
// import HomePage from '../pages/Home/HomePage';
// import AdminPage from '../pages/Admin/AdminPage';

export const PrivateRoute = ({ requiredMenuId }) => {
  const user = useUserStore((state) => state.user);
  const { role } = useParams();
  const location = useLocation();
  const isAuthenticated = authCookie.getAccessToken();

  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && role.toLowerCase() !== user.role.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// Guard cho Public Routes (Login, Register...)
export const PublicRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = authCookie.getAccessToken();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return children;
};

const getAllRoutes = (menu) => {
  let routes = [];
  menu.forEach((cat) => {
    cat.items.forEach((item) => {
      routes.push(item);
      if (item.subItems) routes.push(...item.subItems);
    });
  });
  return routes;
};

export const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <Outlet />
      </PublicRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      //   { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    path: "/admin",
    element: <PrivateRoute />, // Bảo vệ route admin
    children: [{ path: "", element: <AdminPage /> }],
  },
  {
    path: "/user",
    element: <PrivateRoute />, // Bảo vệ route user
    children: [{ path: "", element: <UserPage /> }],
  },
]);
