import React from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { LoginWrapper, LoginCard, Title, SubTitle } from "./styles/Auth.styled";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { RegisterValidation } from "../../validation/AuthValidation";
import { useRegister } from "../../hooks/AuthHook/useRegister";
import { useNotification } from "../../components/common/NotificationStack";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useRegister();
  const { showSuccess, showError } = useNotification();

  const formik = useFormik({
    initialValues: {
      userName: "",
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: RegisterValidation,
    onSubmit: async (values) => {
      try {
        await register({
          userName: values.userName,
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
        });

        showSuccess("Dang ky thanh cong", "Vui long dang nhap de tiep tuc.");
        navigate("/login");
      } catch (err) {
        showError(
          "Dang ky that bai",
          err?.response?.data?.message || "Khong the tao tai khoan",
        );
      }
    },
  });

  return (
    <LoginWrapper>
      <LoginCard>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-blue-700 to-indigo-900 rounded-full flex items-center justify-center mb-5 shadow-xl shadow-blue-900/30 relative">
            <span className="text-white font-black text-2xl tracking-tight">
              L4C
            </span>
            <div className="absolute inset-0 bg-blue-900 rounded-full blur-lg opacity-20 -z-10"></div>
          </div>
          <Title>Tạo tài khoản mới</Title>
          <SubTitle>Điền thông tin để bắt đầu cùng Life4Code</SubTitle>
        </div>

        <div className="flex items-center my-2 mb-5">
          <div className="flex-1 h-px bg-[#23263a]" />
          <span className="mx-3 text-xs text-slate-500 tracking-widest">
            THÔNG TIN TÀI KHOẢN
          </span>
          <div className="flex-1 h-px bg-[#23263a]" />
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
              Tên đăng nhập
            </label>
            <Input
              id="userName"
              name="userName"
              placeholder="ten_dang_nhap"
              {...formik.getFieldProps("userName")}
              error={formik.touched.userName && formik.errors.userName}
              className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
              Họ và tên
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Nguyen Van A"
              {...formik.getFieldProps("name")}
              error={formik.touched.name && formik.errors.name}
              className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                {...formik.getFieldProps("email")}
                error={formik.touched.email && formik.errors.email}
                className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Số điện thoại
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="09xxxxxxxx"
                {...formik.getFieldProps("phoneNumber")}
                error={formik.touched.phoneNumber && formik.errors.phoneNumber}
                className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Mật khẩu
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                {...formik.getFieldProps("password")}
                error={formik.touched.password && formik.errors.password}
                className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...formik.getFieldProps("confirmPassword")}
                error={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg shadow-blue-900/25 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#23263a] text-center">
          <p className="text-sm text-slate-400">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </LoginCard>
    </LoginWrapper>
  );
};

export default RegisterPage;
