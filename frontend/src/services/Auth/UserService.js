import api from "../../configs/axiosConfig";

export const getUserInfo = () => {
    return api.get("/api/auth/info");
};