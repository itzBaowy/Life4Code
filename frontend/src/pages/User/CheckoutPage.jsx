import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCourseCatalogService } from "../../services/Course/CourseService";
import { createMomoPaymentUrlService } from "../../services/Payment/PaymentService";
import { useNotification } from "../../components/common/NotificationStack";

const PAYMENT_METHODS = {
  VNPAY: "vnpay",
  MOMO: "momo",
};

const CheckoutPage = () => {
  const { role = "user", courseId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useNotification();

  const [course, setCourse] = useState(location.state?.course || null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.MOMO);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (course || !courseId) return;

    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const response = await getCourseCatalogService({
          page: 1,
          pageSize: 200,
          isPublished: true,
        });
        const payload = response?.data?.data ?? response?.data?.content;
        const items = Array.isArray(payload?.items) ? payload.items : [];
        const targetCourse = items.find((item) => item.id === courseId) || null;
        setCourse(targetCourse);
      } catch (error) {
        showError(error?.response?.data?.message || "Không thể tải thông tin khóa học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [course, courseId, showError]);

  const price = Number(course?.price || 0);
  const originalPrice = Number(course?.originalPrice || 0);

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price),
    [price],
  );

  const formattedOriginalPrice = useMemo(() => {
    if (!originalPrice || originalPrice <= price) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(originalPrice);
  }, [originalPrice, price]);

  const handleCheckout = async () => {
    if (!courseId) {
      showError("Thiếu thông tin khóa học.");
      return;
    }

    if (selectedMethod !== PAYMENT_METHODS.MOMO) {
      showError("VNPay đang được phát triển, vui lòng chọn MoMo.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await createMomoPaymentUrlService(courseId);
      const payUrl = response?.data?.data?.payUrl || response?.data?.content?.payUrl;

      if (!payUrl) {
        throw new Error("Không nhận được link thanh toán từ hệ thống.");
      }

      window.location.href = payUrl;
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Không thể tạo link thanh toán MoMo.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#23263a] bg-[#151925] p-8 text-center text-slate-300">
        Đang tải thông tin thanh toán...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/${role}/catalog`)}
          className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
        >
          Quay lại
        </button>
        <div className="rounded-xl border border-red-700/40 bg-red-950/20 p-4 text-sm text-red-300">
          Không tìm thấy thông tin khóa học cần thanh toán.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-lg border border-[#2f3652] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#23263a]"
      >
        Quay lại
      </button>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
          <h1 className="text-2xl font-bold text-slate-100">Thanh toán khóa học</h1>
          <p className="mt-1 text-sm text-slate-400">Xác nhận khóa học trước khi chuyển qua cổng thanh toán.</p>

          <div className="mt-5 flex gap-4 rounded-xl border border-[#23263a] bg-[#0f1320] p-4">
            <img
              src={course.thumbnail || "https://placehold.co/600x340?text=Course"}
              alt={course.title || "Course"}
              className="h-28 w-40 rounded-lg object-cover"
            />

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-100">{course.title || "Khóa học"}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{course.description || "Chưa có mô tả."}</p>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-xl font-bold text-cyan-400">{formattedPrice}</span>
                {formattedOriginalPrice ? (
                  <span className="text-sm text-slate-500 line-through">{formattedOriginalPrice}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
          <h2 className="text-lg font-semibold text-slate-100">Phương thức thanh toán</h2>
          <p className="mt-1 text-sm text-slate-400">Chọn ví/cổng thanh toán bạn muốn sử dụng.</p>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setSelectedMethod(PAYMENT_METHODS.VNPAY)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                selectedMethod === PAYMENT_METHODS.VNPAY
                  ? "border-[#0066b3] bg-[#0d1728]"
                  : "border-[#2f3652] bg-[#0f1320] hover:border-[#0066b3]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#0066b3]" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-100">VNPay</p>
                  <p className="text-xs text-slate-400">Đang phát triển</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">Sắp có</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod(PAYMENT_METHODS.MOMO)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                selectedMethod === PAYMENT_METHODS.MOMO
                  ? "border-[#A50064] bg-[#200318]"
                  : "border-[#2f3652] bg-[#0f1320] hover:border-[#A50064]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="text-[#A50064]" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-100">MoMo Wallet</p>
                  <p className="text-xs text-slate-400">Thanh toán online nhanh chóng</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#d277b3]">Khuyến nghị</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="mt-5 w-full rounded-lg bg-[#A50064] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f0058] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isProcessing ? "Đang chuyển hướng thanh toán..." : "Thanh toán với MoMo"}
          </button>
        </aside>
      </section>
    </div>
  );
};

export default CheckoutPage;
