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

export default paymentRouter;
