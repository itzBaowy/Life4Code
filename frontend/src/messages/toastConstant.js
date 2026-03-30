// COLORS - Neon accent colors for Dark Mode
export const TOAST_COLORS = {
    success: "#10b981", // Emerald green
    error: "#ef4444", // Red
    warning: "#f59e0b", // Amber
    info: "#3b82f6", // Blue
};

// AUTHENTICATION MESSAGES
export const AUTH_MESSAGES = {
    // Login
    LOGIN: {
        SUCCESS: {
            title: "Login Successful",
            message: "Welcome back! You have been logged in successfully.",
        },
        INVALID_CREDENTIALS: {
            title: "Login Failed",
            message: "Invalid username or password. Please try again.",
        },
        ACCOUNT_LOCKED: {
            title: "Account Locked",
            message:
                "Your account has been locked due to multiple failed attempts. Please try again in 15 minutes.",
        },
        ACCOUNT_INACTIVE: {
            title: "Account Inactive",
            message:
                "Your account is inactive or disabled. Please contact an administrator.",
        },
        GG_SUCCESS: {
            title: "Login Google",
            message: "Welcome back! You have been logged in successfully.",
        },
        GG_FAIL: {
            title: "Login Failed",
            message: "Oops! Something went wrong with Google Login",
        },
    },

    // Logout
    LOGOUT: {
        SUCCESS: {
            title: "Logged Out",
            message: "You have been logged out successfully.",
        },
        FAILED: {
            title: "Logged Out Failed",
            message: "Failed to Log out! Try again",
        },
        SESSION_EXPIRED: {
            title: "Session Expired",
            message: "Your session has expired. Please log in again.",
        },
    },

    // Register
    REGISTER: {
        SUCCESS: {
            title: "Registration Successful",
            message: "Your account has been created successfully.",
        },
        EMAIL_EXISTS: {
            title: "Registration Failed",
            message:
                "This email is already registered. Please use a different email.",
        },
        VALIDATION_ERROR: {
            title: "Validation Error",
            message: "Please check your input and try again.",
        },
    },

    // Change Password
    CHANGE_PASSWORD: {
        SUCCESS: {
            title: "Password Changed",
            message: "Your password has been updated successfully.",
        },
        INCORRECT_CURRENT: {
            title: "Password Change Failed",
            message: "The current password you entered is incorrect.",
        },
        MISMATCH: {
            title: "Password Mismatch",
            message: "New password and confirm password do not match.",
        },
        WEAK_PASSWORD: {
            title: "Weak Password",
            message:
                "Password must be at least 8 characters with uppercase, lowercase, and numbers.",
        },
    },

    // Forgot Password
    FORGOT_PASSWORD: {
        SUCCESS: {
            title: "Email Sent",
            message:
                "If the email is registered, password reset instructions have been sent.",
        },
        ERROR: {
            title: "Request Failed",
            message: "Unable to process your request. Please try again later.",
        },
    },

    // Two-Factor Authentication (2FA)
    TWO_FACTOR: {
        CODE_SENT: {
            title: "Verification Code Sent",
            message: "A verification code has been sent to your registered device.",
        },
        VERIFIED: {
            title: "Verification Successful",
            message: "Two-factor authentication completed successfully.",
        },
        INVALID_CODE: {
            title: "Invalid Code",
            message: "The verification code you entered is incorrect or expired.",
        },
        ENABLED: {
            title: "2FA Enabled",
            message: "Two-factor authentication has been enabled for your account.",
        },
        DISABLED: {
            title: "2FA Disabled",
            message: "Two-factor authentication has been disabled for your account.",
        },
    },

    // Avatar Update
    AVATAR_UPDATE: {
        SUCCESS: {
            title: "Update Successful",
            message: "Your avatar has been updated successfully!",
        },
        ERROR: {
            title: "Update Failed",
            message: "Unable to update avatar. Please try again.",
        },
        INVALID_FILE: {
            title: "Invalid File",
            message: "Please select an image file in JPG, PNG, or GIF format.",
        },
        FILE_TOO_LARGE: {
            title: "File Too Large",
            message: "File size must not exceed 5MB.",
        },
    },
};

// GENERIC MESSAGES
export const GENERIC_MESSAGES = {
    NETWORK_ERROR: {
        title: "Network Error",
        message: "Unable to connect to the server. Please check your connection.",
    },
    SERVER_ERROR: {
        title: "Server Error",
        message: "Something went wrong. Please try again later.",
    },
    UNAUTHORIZED: {
        title: "Unauthorized",
        message: "You are not authorized to perform this action.",
    },
};