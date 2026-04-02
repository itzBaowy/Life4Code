import axios from "axios";
import crypto from "crypto";
import prisma from "../prisma/connect.prisma.js";
import {
  BadRequestException,
  NotFoundException,
} from "../common/helpers/exception.helper.js";

const buildHmacSha256 = (rawSignature, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
};

const parseExtraData = (extraData) => {
  try {
    const decoded = Buffer.from(String(extraData || ""), "base64").toString("utf8");
    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const verifyMomoSignature = (payload, accessKey, secretKey) => {
  const incomingSignature = String(payload?.signature || "");
  if (!incomingSignature) {
    throw new BadRequestException("Missing MoMo signature");
  }

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${payload.amount ?? ""}` +
    `&extraData=${payload.extraData ?? ""}` +
    `&message=${payload.message ?? ""}` +
    `&orderId=${payload.orderId ?? ""}` +
    `&orderInfo=${payload.orderInfo ?? ""}` +
    `&orderType=${payload.orderType ?? ""}` +
    `&partnerCode=${payload.partnerCode ?? ""}` +
    `&payType=${payload.payType ?? ""}` +
    `&requestId=${payload.requestId ?? ""}` +
    `&responseTime=${payload.responseTime ?? ""}` +
    `&resultCode=${payload.resultCode ?? ""}` +
    `&transId=${payload.transId ?? ""}`;

  const expectedSignature = buildHmacSha256(rawSignature, secretKey);
  if (expectedSignature !== incomingSignature) {
    throw new BadRequestException("Invalid MoMo signature");
  }

  return true;
};

const resolveTransactionByPayload = async (payload) => {
  const orderId = String(payload.orderId || "");
  if (!orderId) {
    throw new BadRequestException("Missing orderId");
  }

  const parsedExtra = parseExtraData(payload.extraData);

  let transaction = await prisma.transaction.findFirst({
    where: { orderId },
  });

  if (!transaction && parsedExtra?.userId && parsedExtra?.courseId) {
    const fallbackAmount = Number(payload.amount || 0);

    transaction = await prisma.transaction.upsert({
      where: { orderId },
      update: {},
      create: {
        userId: parsedExtra.userId,
        courseId: parsedExtra.courseId,
        amount: Number.isFinite(fallbackAmount) ? Math.trunc(fallbackAmount) : 0,
        status: "PENDING",
        provider: "MOMO",
        orderId,
      },
    });
  }

  if (!transaction) {
    throw new NotFoundException("Transaction not found");
  }

  return transaction;
};

const applyMomoPaymentResult = async (payload) => {
  const transaction = await resolveTransactionByPayload(payload);
  const resultCode = Number(payload.resultCode);
  const isSuccess = resultCode === 0;

  if (isSuccess) {
    if (transaction.status !== "SUCCESS") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          amount: Number(payload.amount || transaction.amount),
        },
      });
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: transaction.userId,
          courseId: transaction.courseId,
        },
      },
      create: {
        userId: transaction.userId,
        courseId: transaction.courseId,
        progress: 0,
      },
      update: {},
    });
  } else if (transaction.status !== "FAILED") {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
      },
    });
  }

  return {
    status: isSuccess ? "success" : "failed",
    courseId: transaction.courseId,
    orderId: transaction.orderId,
    resultCode,
  };
};

export const paymentService = {
  async createMomoPayment(req, courseId, amount) {
    try {
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const apiUrl = process.env.MOMO_API_URL;

      if (!partnerCode || !accessKey || !secretKey || !apiUrl) {
        throw new BadRequestException("Missing MoMo configuration in environment variables");
      }

      if (!courseId) {
        throw new BadRequestException("courseId is required");
      }

      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        throw new BadRequestException("amount must be a positive number");
      }

      const requestType = "captureWallet";
      const requestId = req.momoRequestId || `REQ-${Date.now()}`;
      const orderId = req.momoOrderId || `ORDER-${Date.now()}`;
      const redirectUrl =
        process.env.MOMO_REDIRECT_URL ||
        `${req.protocol}://${req.get("host")}/payment/success`;
      const ipnUrl =
        process.env.MOMO_IPN_URL ||
        `${req.protocol}://${req.get("host")}/api/payment/momo-ipn`;
      const orderInfo =
        req.momoOrderInfo || `Thanh toan khoa hoc ${String(courseId)}`;
      const extraData =
        req.momoExtraData ||
        Buffer.from(
          JSON.stringify({
            userId: req.user?.id,
            courseId,
            orderId,
          }),
        ).toString("base64");

      const normalizedAmount = String(Math.trunc(Number(amount)));

      const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${normalizedAmount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${ipnUrl}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

      const signature = buildHmacSha256(rawSignature, secretKey);

      const requestBody = {
        partnerCode,
        partnerName: "Life4Code",
        storeId: "Life4Code",
        requestType,
        ipnUrl,
        redirectUrl,
        orderId,
        amount: normalizedAmount,
        lang: "vi",
        orderInfo,
        requestId,
        extraData,
        signature,
        autoCapture: true,
      };

      const { data } = await axios.post(apiUrl, requestBody, {
        timeout: 20000,
      });

      if (!data?.payUrl) {
        console.error("MoMo create payment response missing payUrl", data);
        throw new BadRequestException("MoMo did not return payUrl");
      }

      return {
        payUrl: data.payUrl,
        orderId,
        requestId,
      };
    } catch (error) {
      console.error("[MoMo][createMomoPayment] Error:", {
        message: error?.message,
        response: error?.response?.data,
      });
      if (error?.code) throw error;
      throw new BadRequestException("Cannot create MoMo payment URL");
    }
  },

  async verifyMomoIpn(req) {
    try {
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;

      if (!accessKey || !secretKey) {
        throw new BadRequestException("Missing MoMo secret configuration");
      }

      const payload = req.body || {};
      verifyMomoSignature(payload, accessKey, secretKey);
      await applyMomoPaymentResult(payload);

      return true;
    } catch (error) {
      console.error("[MoMo][verifyMomoIpn] Error:", {
        message: error?.message,
        payload: req.body,
      });

      if (error?.code) throw error;
      throw new BadRequestException("Cannot verify MoMo IPN");
    }
  },

  async verifyMomoReturn(query) {
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    if (!accessKey || !secretKey) {
      throw new BadRequestException("Missing MoMo secret configuration");
    }

    const payload = query || {};
    verifyMomoSignature(payload, accessKey, secretKey);

    return applyMomoPaymentResult(payload);
  },
};
