import { useState } from "react";
import { loginService } from "../../services/Auth/AuthService";
import { authCookie } from "../../utils/AuthCookie";
import { useGetUserInfo } from "./useGetUserInfo";
import { useUserStore } from "../../store/UserStore";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getInfo } = useGetUserInfo();
    const setUser = useUserStore.getState().setUser;

    const login = async ({ email, password, deviceId }) => {
        setLoading(true);
        setError(null);

        try {
            const res = await loginService({ email, password, deviceId });

            const { accessToken, refreshToken } = res.data.data;
            authCookie.setTokens({ accessToken, refreshToken });

            if (res.data.data.requireOtp) {
                return res.data.data;
            }

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
