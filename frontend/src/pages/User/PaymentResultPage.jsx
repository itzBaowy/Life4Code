import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authCookie } from "../../utils/AuthCookie";
import { useUserStore } from "../../store/UserStore";

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);

  const status = String(searchParams.get("status") || "failed").toLowerCase();
  const courseId = String(searchParams.get("courseId") || "");
  const orderId = String(searchParams.get("orderId") || "");
  const reason = String(searchParams.get("reason") || "");

  const isSuccess = status === "success";
  const hasToken = Boolean(authCookie.getAccessToken());
  const role = String(user?.role || "user").toLowerCase();

  const courseTargetUrl = useMemo(() => {
    if (!courseId) return `/${role}/catalog`;
    return `/${role}/my-courses/${courseId}`;
  }, [courseId, role]);

  useEffect(() => {
    if (!isSuccess || !hasToken || !courseId) return undefined;

    const timer = window.setTimeout(() => {
      navigate(courseTargetUrl, { replace: true });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isSuccess, hasToken, courseId, courseTargetUrl, navigate]);

  const handlePrimaryAction = () => {
    if (isSuccess && hasToken && courseId) {
      navigate(courseTargetUrl, { replace: true });
      return;
    }

    if (isSuccess && !hasToken) {
      navigate("/login", { replace: true });
      return;
    }

    if (hasToken) {
      navigate(`/${role}/catalog`, { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0d16] px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#23263a] bg-[#151925] p-6 shadow-xl">
        <div
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isSuccess
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-100">
          {isSuccess
            ? "Đơn hàng đã được xác nhận"
            : "Không thể xác nhận thanh toán"}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          {isSuccess
            ? "Hệ thống đang xử lý và tự động chuyển bạn đến khóa học đã mua sau 3 giây."
            : "Bạn có thể thử lại hoặc quay về trang khóa học để thanh toán lại."}
        </p>

        <div className="mt-5 space-y-2 rounded-xl border border-[#23263a] bg-[#0f1320] p-4 text-sm text-slate-300">
          <p>
            Trạng thái: <span className="font-semibold text-slate-100">{status}</span>
          </p>
          {courseId ? (
            <p>
              Course ID: <span className="font-semibold text-slate-100">{courseId}</span>
            </p>
          ) : null}
          {orderId ? (
            <p>
              Order ID: <span className="font-semibold text-slate-100">{orderId}</span>
            </p>
          ) : null}
          {reason ? (
            <p>
              Lý do: <span className="font-semibold text-slate-100">{reason}</span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          {isSuccess
            ? hasToken
              ? "Vào khóa học"
              : "Đăng nhập để tiếp tục"
            : "Quay lại"}
        </button>
      </div>
    </div>
  );
};

export default PaymentResultPage;
