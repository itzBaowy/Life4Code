import express from "express";
import { protect } from "../common/middlewares/protect.middleware.js";
import { checkRole } from "../common/middlewares/authorization.middleware.js";
import { userController } from "../controllers/user.controller.js";

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API quản lý người dùng (Admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng (có phân trang và lọc)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 3
 *           minimum: 1
 *         description: Số lượng item trên mỗi trang
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string để lọc dữ liệu (ví dụ {"email":"example","fullName":"John"})
 *         example: '{"name":"John"}'
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get all users successfully
 *                 content:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 3
 *                     totalItem:
 *                       type: integer
 *                       example: 10
 *                     totalPage:
 *                       type: integer
 *                       example: 4
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           roleId:
 *                             type: string
 *                           status:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 */
userRouter.get("/", protect, checkRole(["Admin"]), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Lấy chi tiết user theo ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Lấy chi tiết user thành công
 *       400:
 *         description: userId không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.get("/:userId", protect, checkRole(["Admin"]), userController.getUserById);

/**
 * @swagger
 * /api/users/{userId}/role:
 *   patch:
 *     summary: Cập nhật role cho user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: 65fd8f02e4a8f8d7ab123456
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *       400:
 *         description: userId hoặc roleId không hợp lệ
 *       404:
 *         description: Không tìm thấy user hoặc role
 */
userRouter.patch("/:userId/role", protect, checkRole(["Admin"]), userController.updateUserRole);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Xóa user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Xóa user thành công
 *       400:
 *         description: userId không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 */
userRouter.delete("/:userId", protect, checkRole(["Admin"]), userController.deleteUser);

export default userRouter;
