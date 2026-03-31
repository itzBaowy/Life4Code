import React from 'react';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { LoginWrapper, LoginCard, Title, SubTitle, ErrorText } from './styles/Auth.styled';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useLogin } from '../../hooks/AuthHook/useLogin';
import { LoginValidation } from '../../validation/AuthValidation';
import { useNotification } from '../../components/common/NotificationStack';
import { AUTH_MESSAGES } from '../../messages/toastConstant';

const AutoRedirect = (role) => {
  return role === 'Admin' ? '/admin' : '/';
};

export default function LoginPage() {
  const { login, loading, error } = useLogin();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { userName: '', password: '' },
    validationSchema: LoginValidation,
    onSubmit: async (values) => {
      try {
        const res = await login(values);
        showSuccess("Chào mừng trở lại!", "Chúc bạn một ngày học tập hiệu quả.");
        setTimeout(() => navigate(AutoRedirect(res.role?.name)), 1200);
      } catch (err) {
        const msg = err?.response?.data?.message || AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS.message;
        showError("Đăng nhập thất bại", msg);
      }
    },
  });

  return (
    <LoginWrapper>
      <LoginCard>
        {/* Header Section with polished Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-full flex items-center justify-center mb-5 shadow-xl shadow-blue-900/30 relative">
            <span className="text-white font-black text-2xl tracking-tight">L4C</span>
            <div className="absolute inset-0 bg-blue-900 rounded-full blur-lg opacity-20 -z-10"></div>
          </div>
          <Title>Chào mừng trở lại</Title>
          <SubTitle>Đăng nhập <em>để tiếp tục học tập</em></SubTitle>
        </div>

        {/* Custom spacing 4.5 between form groups */}
        {/* Nút đăng nhập với Google */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl border border-[#23263a] bg-[#181c2b] hover:bg-[#23263a] text-slate-100 font-semibold text-base shadow transition-all"
          onClick={() => {/* TODO: handle Google login */}}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M44.5 20H24V28.5H36.7C35.2 33.1 30.9 36.5 25.5 36.5C18.6 36.5 13 30.9 13 24C13 17.1 18.6 11.5 25.5 11.5C28.5 11.5 31.2 12.6 33.2 14.5L39.1 8.6C35.7 5.5 30.9 3.5 25.5 3.5C14.7 3.5 6 12.2 6 23C6 33.8 14.7 42.5 25.5 42.5C35.2 42.5 43.5 34.7 43.5 25C43.5 23.7 43.4 22.4 43.2 21.2L44.5 20Z" fill="#FFC107"/>
              <path d="M6 12.2L13.7 18.1C15.9 13.7 20.3 11.5 25.5 11.5C28.5 11.5 31.2 12.6 33.2 14.5L39.1 8.6C35.7 5.5 30.9 3.5 25.5 3.5C18.6 3.5 13 7.9 10.2 13.1L6 12.2Z" fill="#FF3D00"/>
              <path d="M25.5 42.5C30.8 42.5 35.3 40.6 38.6 37.6L31.4 31.3C29.5 32.7 27.1 33.5 25.5 33.5C20.2 33.5 15.9 30.1 14.3 25.5L6 26.4C8.8 34.1 16.4 42.5 25.5 42.5Z" fill="#4CAF50"/>
              <path d="M44.5 20H24V28.5H36.7C36 30.6 34.7 32.4 33 33.7L40.2 39.9C43.7 36.7 46 31.7 46 25C46 23.7 45.9 22.4 45.7 21.2L44.5 20Z" fill="#1976D2"/>
            </g>
          </svg>
          Tiếp tục với Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-[#23263a]" />
          <span className="mx-3 text-xs text-slate-500 tracking-widest">HOẶC TIẾP TỤC VỚI TÊN ĐĂNG NHẬP</span>
          <div className="flex-1 h-px bg-[#23263a]" />
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
              Email
            </label>
            <Input
              id="userName"
              name="userName"
              type="text"
              placeholder="email@example.com"
              {...formik.getFieldProps('userName')}
              error={formik.touched.userName && formik.errors.userName}
              className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-sm font-semibold text-slate-200">
                Mật khẩu
              </label>
              <Link to="/forgot-password" title="Khôi phục mật khẩu?" className="text-xs text-blue-400 font-medium hover:underline hover:text-blue-300 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              error={formik.touched.password && formik.errors.password}
              className="w-full py-3 px-5 rounded-xl bg-[#181c2b] border border-[#23263a] text-slate-100 placeholder:text-slate-500 focus:bg-[#23263a] focus:ring-2 focus:ring-blue-700/40 focus:border-blue-600 transition-all shadow-inner shadow-black/10"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3.5 mt-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg shadow-blue-900/25 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                Đang xác thực...
              </div>
            ) : 'Đăng nhập'}
          </Button>
        </form>

        {/* Footer section with clear hierarchy */}
        <div className="mt-10 pt-7 border-t border-[#23263a] text-center">
          <p className="text-sm text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Đăng ký
            </Link>
          </p>
        </div>
      </LoginCard>
    </LoginWrapper>
  );
}