import api from "../../configs/axiosConfig";

export const getUserInfo = () => {
    return api.get("/api/auth/info");
};

export const updateUserInfo = (payload) => {
    return api.patch("/api/auth/info", payload);
};