import { useState } from "react";
import { getUserInfo } from "../../services/Auth/UserService";
import { useUserStore } from "../../store/UserStore";

export const useGetUserInfo = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getUserInfo();

            const setUser = useUserStore.getState().setUser;

            if (res.data.status === "success") {
                setUser(res.data.data);
            }

            return res.data.data;
        } catch (error) {
            const message = error.response.data.message;
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, getInfo };
};
