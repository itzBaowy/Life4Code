import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { buildMenuByPermissions, menuConfig } from "../../configs/menuConfig";
import { useUserStore } from "../../store/UserStore";

const Sidebar = () => {
  const { role: routeRole } = useParams();
  const user = useUserStore((state) => state.user);

  const userRole = String(user?.role || routeRole || "user").toLowerCase();
  const allowedIds = buildMenuByPermissions(user);

  const canAccess = (menuId) => {
    if (!menuId) return true;
    if (allowedIds === "ALL") return true;
    if (allowedIds instanceof Set) return allowedIds.has(menuId);
    return false;
  };

  const getMenuItems = () => {
    const items = [];

    menuConfig.forEach((group) => {
      (group.items || []).forEach((item) => {
        if (item.subItems?.length) {
          item.subItems.forEach((sub) => {
            if (canAccess(sub.id)) {
              items.push({
                id: sub.id,
                label: sub.label,
                path: sub.path,
              });
            }
          });
          return;
        }

        if (canAccess(item.id)) {
          items.push({
            id: item.id,
            label: item.label,
            path: item.path,
          });
        }
      });
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-[#23263a] bg-[#151925] p-4">
      <div className="mb-6 px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${userRole}/${item.path}`}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-600 text-white"
                  : "text-slate-200 hover:bg-[#23263a]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
