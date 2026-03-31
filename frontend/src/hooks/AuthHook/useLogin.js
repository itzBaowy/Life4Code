import { useState } from "react";
import { loginService } from "../../services/Auth/AuthService";
import { authCookie } from "../../utils/AuthCookie";
import { useGetUserInfo } from "./useGetUserInfo";
import { useUserStore } from "../../store/UserStore";
import { useNotification } from "../../components/common/NotificationStack";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useNotification();
    const { getInfo } = useGetUserInfo();
    const setUser = useUserStore((state) => state.setUser);

    const login = async ({ userName, password }) => {
        setLoading(true);
        setError(null);

        try {
            const res = await loginService({ userName, password });

            const { accessToken, refreshToken } = res.data.data;
            authCookie.setTokens({ accessToken, refreshToken });

            const user = await getInfo();

            setUser(user);

            return user;
        } catch (error) {
            const message = error.response.data.message;
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, login };
};
