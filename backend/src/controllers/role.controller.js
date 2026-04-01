import { responseSuccess } from "../common/helpers/function.helper.js";
import { roleService } from "../services/role.service.js";

export const roleController = {
    async getAllRoles(req, res, next) {
        const result = await roleService.getAllRoles(req);
        const response = responseSuccess(result, "Get roles successfully");
        res.status(response.statusCode).json(response);
    },

    async getRoleById(req, res, next) {
        const result = await roleService.getRoleById(req);
        const response = responseSuccess(result, "Get role detail successfully");
        res.status(response.statusCode).json(response);
    },

    async createRole(req, res, next) {
        const result = await roleService.createRole(req);
        const response = responseSuccess(result, "Create role successfully", 201);
        res.status(response.statusCode).json(response);
    },

    async updateRole(req, res, next) {
        const result = await roleService.updateRole(req);
        const response = responseSuccess(result, "Update role successfully");
        res.status(response.statusCode).json(response);
    },

    async deleteRole(req, res, next) {
        const result = await roleService.deleteRole(req);
        const response = responseSuccess(result, "Delete role successfully");
        res.status(response.statusCode).json(response);
    },
};
