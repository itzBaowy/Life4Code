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
    <div className="relative z-50 flex h-16 w-full items-center justify-between border-b border-[#23263a] bg-[#151925] px-6 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo192.png" alt="Logo" className="h-10 w-10" />
        <span className="text-xl font-bold text-cyan-400">Life4Code</span>
      </div>
      {/* Notification & Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification bell */}
        <button className="relative focus:outline-none">
          <span className="material-symbols-outlined text-2xl text-slate-200">
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
            <div className="absolute right-0 z-50 mt-2 w-48 rounded border border-[#23263a] bg-[#151925] py-2 shadow-lg">
              <div className="border-b border-[#23263a] px-4 py-2">
                <div className="font-semibold text-slate-100">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
              <button
                className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#23263a]"
                onClick={() => alert("Hồ sơ cá nhân")}
              >
                Hồ sơ cá nhân
              </button>
              <button
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#23263a]"
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
