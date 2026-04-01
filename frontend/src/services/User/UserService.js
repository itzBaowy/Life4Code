import api from "../../configs/axiosConfig";

export const getAllUsersService = (params = {}) => {
    const query = new URLSearchParams();

    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.keyword) query.set("keyword", String(params.keyword));
    if (params.role) query.set("role", String(params.role));
    if (params.filters) query.set("filters", JSON.stringify(params.filters));

    const queryString = query.toString();
    return api.get(`/api/users${queryString ? `?${queryString}` : ""}`);
};

export const getUserDetailService = (userId) => api.get(`/api/users/${userId}`);

export const updateUserRoleService = (userId, roleId) =>
    api.patch(`/api/users/${userId}/role`, { roleId });

export const deleteUserService = (userId) => api.delete(`/api/users/${userId}`);

export const getAllRolesService = () => api.get(`/api/roles`);
