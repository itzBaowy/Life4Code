import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import { authCookie } from "../utils/AuthCookie";
import { useUserStore } from "../store/UserStore";
import Unauthorized from "../pages/Auth/Unauthorized";
import PageNotFound from "../pages/Error/PageNotFound";
import Layout from "../layouts/Layout";
import UserLayout from "../layouts/UserLayout";
import DynamicComponent from "./DynamicComponent";
import { buildMenuByPermissions, menuConfig } from "../configs/menuConfig";

export const PrivateRoute = ({ requiredMenuId, children }) => {
  const user = useUserStore((state) => state.user);
  const { role } = useParams();
  const location = useLocation();
  const isAuthenticated = authCookie.getAccessToken();
  const normalizedRouteRole = String(role || "").toLowerCase();
  const userRole = user?.role?.name || user?.role;
  const normalizedUserRole = String(userRole || "").toLowerCase();

  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    normalizedRouteRole &&
    normalizedUserRole &&
    normalizedRouteRole !== normalizedUserRole
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredMenuId) {
    const allowedIds = buildMenuByPermissions(user);
    const hasPermission =
      allowedIds === "ALL" ||
      (allowedIds instanceof Set && allowedIds.has(requiredMenuId));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children || <Outlet />;
};

// Guard cho Public Routes (Login, Register...)
export const PublicRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = authCookie.getAccessToken();
  const userRole = user?.role?.name || user?.role;
  const normalizedUserRole = String(userRole || "").toLowerCase();

  if (isAuthenticated && user && normalizedUserRole) {
    return <Navigate to={`/${normalizedUserRole}/dashboard`} replace />;
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
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/:role",
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          ...getAllRoutes(menuConfig).map((route) => ({
            path: route.path,
            element: (
              <PrivateRoute requiredMenuId={route.id}>
                <DynamicComponent routeId={route.id} />
              </PrivateRoute>
            ),
          })),
        ],
      },
      {
        element: <UserLayout />,
        children: [
          {
            path: "profile",
            element: (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                Thong tin ca nhan
              </div>
            ),
          },
        ],
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <PageNotFound /> },
]);
