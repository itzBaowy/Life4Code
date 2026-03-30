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

export default api;


