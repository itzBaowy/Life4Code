import { BadRequestException } from "./exception.helper.js";

export function validatePassword(password) {
    if (!password) {
        throw new BadRequestException("Password không được để trống");
    }

    // kí tự yêu cầu phải ít nhất 8
    if (password.length < 8) {
        throw new BadRequestException(
            "Password phải có ít nhất 8 ký tự"
        );
    }

    // Có ít nhất 1 kí tự in hoa
    if (!/[A-Z]/.test(password)) {
        throw new BadRequestException(
            "Password phải chứa ít nhất một ký tự in hoa",
        );
    }

    // Có ít nhất 1 kí tự ghi thường
    if (!/[a-z]/.test(password)) {
        throw new BadRequestException(
            "Password phải chứa ít nhất một ký tự viết thường",
        );
    }

    // Có ít nhất 1 số
    if (!/[0-9]/.test(password)) {
        throw new BadRequestException("Password phải chứa ít nhất một số");
    }

    return true;
}

export function validateEmail(email) {
    if (!email) {
        throw new BadRequestException("Email không được để trống");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // validate email theo form ...@...
    if (!emailRegex.test(email)) {
        throw new BadRequestException(
            "Định dạng email không hợp lệ. Email phải ở định dạng: example@domain.com",
        );
    }

    return true;
}

// Validate username: không chứa ký tự đặc biệt, tối đa 30 ký tự
export function validateUsername(username) {
    if (!username) {
        throw new BadRequestException("Username không được để trống");
    }
    // Chỉ cho phép chữ cái, số, dấu gạch dưới, tối đa 30 ký tự
    const usernameRegex = /^[a-zA-Z0-9_]{1,30}$/;
    if (!usernameRegex.test(username)) {
        throw new BadRequestException(
            "Username không được chứa ký tự đặc biệt và phải có tối đa 30 ký tự"
        );
    }
    return true;
}

export function validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        throw new BadRequestException("Số điện thoại không được để trống");
    }

    // Chỉ cho phép số, tối đa 15 ký tự
    const phoneRegex = /^[0-9]{1,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
        throw new BadRequestException(
            "Số điện thoại chỉ được chứa số và phải có tối đa 15 ký tự"
        );
    }
    return true;
}

export function validateName(name) {
    if (!name) {
        throw new BadRequestException("Tên không được để trống");
    }
    // Chỉ cho phép chữ cái và khoảng trắng, tối đa 50 ký tự
    const nameRegex = /^[a-zA-Z\s]{1,50}$/;
    if (!nameRegex.test(name)) {
        throw new BadRequestException(
            "Tên chỉ được chứa chữ cái và khoảng trắng, tối đa 50 ký tự"
        );
    }
    return true;
} 