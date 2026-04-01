import * as Yup from 'yup';

export const LoginValidation = Yup.object().shape({
    userName: Yup.string()
        .required('Vui lòng nhập tên đăng nhập'),
    password: Yup.string()
        .min(6, 'Mật khẩu tối thiểu 6 ký tự')
        .required('Vui lòng nhập mật khẩu'),
});

export const RegisterValidation = Yup.object().shape({
    userName: Yup.string().required('Vui lòng nhập tên đăng nhập'),
    name: Yup.string().required('Vui lòng nhập họ tên'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    phoneNumber: Yup.string().required('Vui lòng nhập số điện thoại'),
    password: Yup.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').required('Vui lòng nhập mật khẩu'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu'),
});
