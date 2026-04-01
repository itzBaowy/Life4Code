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
        <div className="flex flex-col items-center mb-6">
          <Title>Tao tai khoan</Title>
          <SubTitle>Bat dau voi he thong Life4Code</SubTitle>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            id="userName"
            name="userName"
            placeholder="Ten dang nhap"
            {...formik.getFieldProps("userName")}
            error={formik.touched.userName && formik.errors.userName}
          />
          <Input
            id="name"
            name="name"
            placeholder="Ho va ten"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            {...formik.getFieldProps("email")}
            error={formik.touched.email && formik.errors.email}
          />
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="So dien thoai"
            {...formik.getFieldProps("phoneNumber")}
            error={formik.touched.phoneNumber && formik.errors.phoneNumber}
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mat khau"
            {...formik.getFieldProps("password")}
            error={formik.touched.password && formik.errors.password}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Xac nhan mat khau"
            {...formik.getFieldProps("confirmPassword")}
            error={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Dang tao tai khoan..." : "Dang ky"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Da co tai khoan?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-400 hover:underline"
          >
            Dang nhap
          </Link>
        </p>
      </LoginCard>
    </LoginWrapper>
  );
};

export default RegisterPage;
