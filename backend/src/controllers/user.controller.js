import { responseSuccess } from "../common/helpers/function.helper.js";
import { userService } from "../services/user.service.js";

export const userController = {
    async getAllUsers(req, res, next) {
        const result = await userService.getAllUsers(req);
        const response = responseSuccess(result, "Get users successfully");
        res.status(response.statusCode).json(response);
    },

    async getUserById(req, res, next) {
        const result = await userService.getUserById(req);
        const response = responseSuccess(result, "Get user detail successfully");
        res.status(response.statusCode).json(response);
    },

    async updateUserRole(req, res, next) {
        const result = await userService.updateUserRole(req);
        const response = responseSuccess(result, "Update user role successfully");
        res.status(response.statusCode).json(response);
    },

    async deleteUser(req, res, next) {
        const result = await userService.deleteUser(req);
        const response = responseSuccess(result, "Delete user successfully");
        res.status(response.statusCode).json(response);
    },
};
