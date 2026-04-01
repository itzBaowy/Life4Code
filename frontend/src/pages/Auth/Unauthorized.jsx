import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Không có quyền truy cập
        </h1>
        <p className="mt-2 text-slate-600">
          Tài khoản của bạn không có quyền truy cập vào trang này.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Quay về đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
