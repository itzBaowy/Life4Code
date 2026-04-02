import prisma from "../prisma/connect.prisma.js";
import { responseSuccess } from "../common/helpers/function.helper.js";
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "../common/helpers/exception.helper.js";
import { paymentService } from "../services/payment.service.js";

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

export const paymentController = {
  async createMomoUrl(req, res, next) {
    try {
      const userId = req.user?.id;
      const { courseId } = req.body || {};

      if (!userId || !isObjectId(userId)) {
        throw new BadRequestException("Invalid user");
      }

      if (!isObjectId(courseId)) {
        throw new BadRequestException("courseId không hợp lệ");
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          price: true,
          isPublished: true,
        },
      });

      if (!course) {
        throw new NotFoundException("Không tìm thấy khóa học");
      }

      if (!course.isPublished) {
        throw new ForbiddenException("Khóa học chưa mở thanh toán");
      }

      const normalizedAmount = Number(course.price || 0);

      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        throw new BadRequestException("Khóa học này không yêu cầu thanh toán qua MoMo");
      }

      const orderId = `L4C-MOMO-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      const requestId = `L4C-REQ-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      const orderInfo = `Thanh toan khoa hoc ${course.title}`;

      await prisma.transaction.create({
        data: {
          userId,
          courseId,
          amount: Math.trunc(normalizedAmount),
          status: "PENDING",
          provider: "MOMO",
          orderId,
        },
      });

      req.momoOrderId = orderId;
      req.momoRequestId = requestId;
      req.momoOrderInfo = orderInfo;
      req.momoExtraData = Buffer.from(
        JSON.stringify({ userId, courseId, orderId }),
      ).toString("base64");

      const result = await paymentService.createMomoPayment(
        req,
        courseId,
        Math.trunc(normalizedAmount),
      );

      const response = responseSuccess(result, "Create MoMo payment URL successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async momoIpn(req, res, next) {
    try {
      await paymentService.verifyMomoIpn(req);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async momoResult(req, res) {
    const frontendResultUrl =
      process.env.FRONTEND_PAYMENT_RESULT_URL ||
      "http://localhost:5173/payment/result";

    const buildRedirect = (params = {}) => {
      const url = new URL(frontendResultUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== "") {
          url.searchParams.set(key, String(value));
        }
      });
      return url.toString();
    };

    try {
      const result = await paymentService.verifyMomoReturn(req.query);

      return res.redirect(
        buildRedirect({
          status: result.status,
          courseId: result.courseId,
          orderId: result.orderId,
        }),
      );
    } catch (error) {
      console.error("[MoMo][momoResult]", {
        message: error?.message,
        query: req.query,
      });

      return res.redirect(
        buildRedirect({
          status: "failed",
          reason: "invalid_signature",
        }),
      );
    }
  },
};
