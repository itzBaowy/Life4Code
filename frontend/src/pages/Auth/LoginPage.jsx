import React from 'react';
import { useFormik } from 'formik';
import { LoginWrapper, LoginCard, Title, ErrorText } from './styles/Auth.styled';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useLogin } from '../../hooks/AuthHook/useLogin';
import { LoginValidation } from '../../validation/AuthValidation';

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const formik = useFormik({
    initialValues: {
      userName: '',
      password: '',
    },
    validationSchema: LoginValidation,
    onSubmit: async (values) => {   
      try {
        await login(values);
        // TODO: Redirect or show success
      } catch (e) {
        // Error handled in hook
      }
    },
  });

  return (
    <LoginWrapper>
      <LoginCard>
        <Title>Đăng nhập</Title>
        {error && <ErrorText>{error}</ErrorText>}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            id="userName"
            name="userName"
            type="text"
            placeholder="Tên đăng nhập"
            value={formik.values.userName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.userName && formik.errors.userName}
            autoFocus
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </LoginCard>
    </LoginWrapper>
  );
}
