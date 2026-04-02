import express from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const paymentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: API thanh toán khóa học
 */

/**
 * @swagger
 * /api/payment/momo/create-url:
 *   post:
 *     summary: Tạo link thanh toán MoMo
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                type: string
 *     responses:
 *       200:
 *         description: Tạo payUrl thành công
 */
paymentRouter.post("/momo/create-url", protect, paymentController.createMomoUrl);

/**
 * @swagger
 * /api/payment/momo-ipn:
 *   post:
 *     summary: Webhook IPN từ MoMo
 *     tags: [Payment]
 *     responses:
 *       204:
 *         description: Xử lý IPN thành công
 */
paymentRouter.post("/momo-ipn", paymentController.momoIpn);

/**
 * @swagger
 * /api/payment/momo-result:
 *   get:
 *     summary: MoMo redirect callback (verify hash và chuyển hướng về frontend)
 *     tags: [Payment]
 *     responses:
 *       302:
 *         description: Redirect về trang kết quả thanh toán ở frontend
 */
paymentRouter.get("/momo-result", paymentController.momoResult);

// Alias để tương thích nếu env cũ đang dùng /api/payment/result
paymentRouter.get("/result", paymentController.momoResult);

export default paymentRouter;
