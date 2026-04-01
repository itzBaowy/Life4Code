import React, { useState } from "react";
import { useUserStore } from "../../store/UserStore";

const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [openProfile, setOpenProfile] = useState(false);

  const handleLogout = () => {
    clearUser();
    window.location.href = "/login";
  };

  return (
    <div className="w-full h-16 flex items-center justify-between px-6 bg-white shadow-md z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo192.png" alt="Logo" className="h-10 w-10" />
        <span className="font-bold text-xl text-blue-600">Life4Code</span>
      </div>
      {/* Notification & Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification bell */}
        <button className="relative focus:outline-none">
          <span className="material-symbols-outlined text-2xl">
            notifications
          </span>
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            1
          </span>
        </button>
        {/* Avatar */}
        <div className="relative">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="h-10 w-10 rounded-full border-2 border-blue-400 cursor-pointer"
            onClick={() => setOpenProfile((prev) => !prev)}
          />
          {/* Dropdown */}
          {openProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b">
                <div className="font-semibold">{user?.name || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => alert("Hồ sơ cá nhân")}
              >
                Hồ sơ cá nhân
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
