import * as Yup from 'yup';

export const LoginValidation = Yup.object().shape({
    userName: Yup.string()
        .required('Vui lòng nhập tên đăng nhập'),
    password: Yup.string()
        .min(6, 'Mật khẩu tối thiểu 6 ký tự')
        .required('Vui lòng nhập mật khẩu'),
});
