import React, { useEffect, useState } from "react";
import {
  createCouponService,
  deleteCouponService,
  getCouponsService,
  updateCouponService,
} from "../../services/Coupon/CouponService";
import { useNotification } from "../../components/common/NotificationStack";

const initialForm = {
  code: "",
  discountType: "PERCENT",
  discount: "",
  maxUsage: "",
  validFrom: "",
  validTo: "",
  isActive: true,
};

const toDatetimeInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const normalizeErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const CouponManagementPage = () => {
  const { showSuccess, showError } = useNotification();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const loadCoupons = async (nextKeyword = keyword) => {
    setIsLoading(true);
    try {
      const res = await getCouponsService({ keyword: nextKeyword || undefined });
      const payload = res?.data?.data ?? res?.data?.content;
      setItems(Array.isArray(payload) ? payload : []);
    } catch (error) {
      showError("Load Failed", normalizeErrorMessage(error, "Không thể tải mã giảm giá"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => ({
    code: String(formData.code || "").trim().toUpperCase(),
    discountType: String(formData.discountType || "PERCENT").toUpperCase(),
    discount: Number(formData.discount || 0),
    maxUsage: Number(formData.maxUsage || 0),
    validFrom: formData.validFrom,
    validTo: formData.validTo,
    isActive: Boolean(formData.isActive),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      if (!payload.code || !payload.discount || !payload.maxUsage || !payload.validFrom || !payload.validTo) {
        showError("Validation", "Vui lòng nhập đủ thông tin mã giảm giá");
        return;
      }

      if (editingId) {
        await updateCouponService(editingId, payload);
        showSuccess("Updated", "Đã cập nhật mã giảm giá");
      } else {
        await createCouponService(payload);
        showSuccess("Created", "Đã tạo mã giảm giá");
      }

      resetForm();
      await loadCoupons();
    } catch (error) {
      showError(
        editingId ? "Update Failed" : "Create Failed",
        normalizeErrorMessage(error, "Không thể lưu mã giảm giá"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      code: item.code || "",
      discountType: String(item.discountType || "PERCENT").toUpperCase(),
      discount: String(item.discount || ""),
      maxUsage: String(item.maxUsage || ""),
      validFrom: toDatetimeInputValue(item.validFrom),
      validTo: toDatetimeInputValue(item.validTo),
      isActive: Boolean(item.isActive),
    });
  };

  const handleDelete = async (id, code) => {
    const accepted = window.confirm(`Bạn chắc chắn muốn xóa mã ${code}?`);
    if (!accepted) return;

    try {
      await deleteCouponService(id);
      showSuccess("Deleted", "Đã xóa mã giảm giá");
      if (editingId === id) resetForm();
      await loadCoupons();
    } catch (error) {
      showError("Delete Failed", normalizeErrorMessage(error, "Không thể xóa mã"));
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const nextKeyword = search.trim();
    setKeyword(nextKeyword);
    await loadCoupons(nextKeyword);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h1 className="text-2xl font-bold text-slate-100">Quản lý mã giảm giá</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tạo và quản lý coupon để user áp dụng khi checkout.
        </p>
      </section>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo code..."
            className="flex-1 rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#23263a]"
          >
            Tìm kiếm
          </button>
        </form>

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
            Đang tải mã giảm giá...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
            Chưa có mã giảm giá nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-[#2a2f45] text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Code</th>
                  <th className="px-3 py-3">Discount</th>
                  <th className="px-3 py-3">Đã dùng</th>
                  <th className="px-3 py-3">Thời gian</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#1f2438]">
                    <td className="px-3 py-3 font-semibold text-cyan-300">{item.code}</td>
                    <td className="px-3 py-3">
                      {String(item.discountType || "PERCENT").toUpperCase() === "FIXED"
                        ? `${Number(item.discount || 0).toLocaleString("vi-VN")} VND`
                        : `${item.discount}%`}
                    </td>
                    <td className="px-3 py-3">{item.usedCount}/{item.maxUsage}</td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {new Date(item.validFrom).toLocaleString("vi-VN")}<br />
                      {new Date(item.validTo).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-600/30 text-slate-300"
                      }`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.code)}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          {editingId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Mã code, ví dụ: SUMMER26"
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
          />
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
          >
            <option value="PERCENT">Giảm theo %</option>
            <option value="FIXED">Giảm số tiền cố định</option>
          </select>
          <input
            type="number"
            min={1}
            max={formData.discountType === "PERCENT" ? 100 : undefined}
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            placeholder={formData.discountType === "PERCENT" ? "Phần trăm giảm" : "Số tiền giảm (VND)"}
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
          />
          <input
            type="number"
            min={1}
            name="maxUsage"
            value={formData.maxUsage}
            onChange={handleChange}
            placeholder="Số lượt dùng tối đa"
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
          />
          <div>
            <p className="mb-1 text-xs text-slate-400">Bắt đầu</p>
            <input
              type="datetime-local"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Kết thúc</p>
            <input
              type="datetime-local"
              name="validTo"
              value={formData.validTo}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-slate-100 outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Kích hoạt mã
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#23263a]"
          >
            Làm mới
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponManagementPage;
