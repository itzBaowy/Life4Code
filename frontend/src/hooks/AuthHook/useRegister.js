import { useState } from "react";
import { registerService } from "../../services/Auth/AuthService";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const register = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            const res = await registerService(payload);
            return res.data;
        } catch (err) {
            const message = err?.response?.data?.message || "Dang ky that bai";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, register };
};
