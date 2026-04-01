import express from "express";
import { protect } from "../common/middlewares/protect.middleware.js";
import { checkRole } from "../common/middlewares/authorization.middleware.js";
import { roleController } from "../controllers/role.controller.js";

const roleRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: API quản lý role (Admin)
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lấy danh sách role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách role thành công
 *       403:
 *         description: Không có quyền admin
 */
roleRouter.get("/", protect, checkRole(["Admin"]), roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   get:
 *     summary: Lấy chi tiết role theo ID
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của role
 *     responses:
 *       200:
 *         description: Lấy chi tiết role thành công
 *       400:
 *         description: roleId không hợp lệ
 *       404:
 *         description: Không tìm thấy role
 */
roleRouter.get("/:roleId", protect, checkRole(["Admin"]), roleController.getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Tạo role mới
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Instructor
 *               description:
 *                 type: string
 *                 example: Quản lý khóa học được phân công
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["course-management", "my-courses"]
 *     responses:
 *       201:
 *         description: Tạo role thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
roleRouter.post("/", protect, checkRole(["Admin"]), roleController.createRole);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   patch:
 *     summary: Cập nhật role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: User
 *               description:
 *                 type: string
 *                 example: Vai trò học viên
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["my-courses"]
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *       400:
 *         description: roleId hoặc dữ liệu cập nhật không hợp lệ
 *       404:
 *         description: Không tìm thấy role
 */
roleRouter.patch("/:roleId", protect, checkRole(["Admin"]), roleController.updateRole);

/**
 * @swagger
 * /api/roles/{roleId}:
 *   delete:
 *     summary: Xóa role
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của role
 *     responses:
 *       200:
 *         description: Xóa role thành công
 *       400:
 *         description: roleId không hợp lệ
 *       404:
 *         description: Không tìm thấy role
 */
roleRouter.delete("/:roleId", protect, checkRole(["Admin"]), roleController.deleteRole);

export default roleRouter;
