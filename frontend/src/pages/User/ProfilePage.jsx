import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGetUserInfo } from "../../hooks/AuthHook/useGetUserInfo";
import { useUserStore } from "../../store/UserStore";
import { updateUserInfo } from "../../services/Auth/UserService";
import { useNotification } from "../../components/common/NotificationStack";

const formatDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ProfileItem = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-[#2f3652] bg-[#0f1320] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { loading, error, getInfo } = useGetUserInfo();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!user?.id) {
      getInfo().catch(() => null);
    }
  }, []);

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    });
  }, [user?.name, user?.email, user?.phoneNumber]);

  const roleLabel = useMemo(() => {
    const role = String(user?.role || "");
    if (!role) return "--";
    return role;
  }, [user?.role]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showError("Validation Error", "Họ tên không được để trống");
      return;
    }

    if (!formData.email.trim()) {
      showError("Validation Error", "Email không được để trống");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      showError("Validation Error", "Số điện thoại không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUserInfo({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      const payload = response?.data?.data ?? response?.data?.content;
      if (payload) {
        setUser(payload);
      }

      showSuccess("Update Success", "Đã cập nhật thông tin cá nhân");
    } catch (updateError) {
      showError(
        "Update Failed",
        updateError?.response?.data?.message ||
          "Không thể cập nhật thông tin cá nhân",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-slate-100">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-400">
          Thông tin tài khoản của bạn trong hệ thống Life4Code.
        </p>
      </section>

      {loading ? (
        <section className="rounded-xl border border-[#23263a] bg-[#151925] p-6 text-sm text-slate-400 shadow-sm">
          Đang tải thông tin hồ sơ...
        </section>
      ) : error ? (
        <section className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300 shadow-sm">
          {error}
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-100">
              Thông tin hệ thống
            </h2>
            <div className="space-y-3">
              <ProfileItem label="User ID" value={user?.id || "--"} />
              <ProfileItem label="Username" value={user?.userName || "--"} />
              <ProfileItem label="Vai trò" value={roleLabel} />
              <ProfileItem
                label="Ngày tạo tài khoản"
                value={formatDateTime(user?.createdAt)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Cập nhật thông tin cá nhân
              </h2>
              <button
                type="button"
                onClick={() => getInfo().catch(() => null)}
                className="rounded-lg border border-[#2f3652] px-3 py-1.5 text-sm font-semibold text-slate-300 hover:bg-[#23263a]"
              >
                Làm mới
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Họ tên
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Số điện thoại
                </label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
