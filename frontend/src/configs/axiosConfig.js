import axios from 'axios';
import { authCookie } from '../utils/AuthCookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

refreshApi.interceptors.request.use(
    (config) => {
        const token = authCookie.getAccessToken?.();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.request.use(
    (config) => {
        const token = authCookie.getAccessToken?.();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;

        if (!error.response) {
            return Promise.reject(error);
        }

        // // Handle session expiry immediately - no refresh token attempt.
        // if (status === 401 && String(errorMessage || '').includes('Session expired')) {
        //     handleLogout();
        //     return Promise.reject(error);
        // }

        const originalRequest = error.config;
        const refreshStatuses = [401, 403];

        if (!refreshStatuses.includes(status) || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshToken = authCookie.getRefreshToken();

            const res = await refreshApi.post('/api/auth/refresh-token', {
                refreshToken,
            });

            const { accessToken, refreshToken: nextRefreshToken } = res.data.data;

            authCookie.setTokens({ accessToken, refreshToken: nextRefreshToken });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return api(originalRequest);
        } catch (err) {
            handleLogout();
            return Promise.reject(err);
        }
    },
);

const handleLogout = () => {
    authCookie.clearAccessTokens();
    authCookie.clearRefreshToken();

    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

export default api;


