import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useUserStore } from "../../store/UserStore";

const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "ntf-1",
      content: "Ban vua duoc mo quyen vao module User Dashboard moi.",
      time: "10 phut truoc",
      isRead: false,
    },
    {
      id: "ntf-2",
      content: "Giang vien da danh gia bai tap Login/Register cua ban.",
      time: "2 gio truoc",
      isRead: false,
    },
    {
      id: "ntf-3",
      content: "Co cap nhat tai lieu cho phan Router va Route Guard.",
      time: "Hom qua",
      isRead: true,
    },
  ]);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUser();
    window.location.href = "/login";
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#23263a] bg-[#151925] px-6 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo192.png" alt="Logo" className="h-10 w-10" />
        <span className="text-xl font-bold text-cyan-400">Life4Code</span>
      </div>
      {/* Notification & Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification bell */}
        <div ref={notificationRef} className="relative">
          <button
            className="relative rounded-md p-1.5 text-slate-200 transition hover:bg-[#23263a]"
            onClick={() => setOpenNotifications((prev) => !prev)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-[#23263a] bg-[#151925] shadow-xl">
              <div className="flex items-center justify-between border-b border-[#23263a] px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-3">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`mb-2 rounded-md border p-3 last:mb-0 ${
                      item.isRead
                        ? "border-[#23263a] bg-[#0f1320]"
                        : "border-cyan-700/40 bg-[#11172a]"
                    }`}
                  >
                    <p className="text-sm text-slate-100">{item.content}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Avatar */}
        <div ref={profileRef} className="relative">
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
