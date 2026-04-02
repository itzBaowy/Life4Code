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

const normalizeCouponCode = (value) =>
  String(value || "").trim().toUpperCase();

const normalizeCouponDiscountType = (value) => {
  const normalized = String(value || "PERCENT").trim().toUpperCase();
  return normalized === "FIXED" ? "FIXED" : "PERCENT";
};

const validateCouponInput = ({ code, discountType, discount, maxUsage, validFrom, validTo }) => {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) {
    throw new BadRequestException("code không được để trống");
  }

  const normalizedDiscountType = normalizeCouponDiscountType(discountType);

  const parsedDiscount = Number(discount);
  if (!Number.isInteger(parsedDiscount) || parsedDiscount <= 0) {
    throw new BadRequestException("discount phải là số nguyên dương");
  }

  if (normalizedDiscountType === "PERCENT" && parsedDiscount > 100) {
    throw new BadRequestException("discount phải từ 1 đến 100 với kiểu PERCENT");
  }

  const parsedMaxUsage = Number(maxUsage);
  if (!Number.isInteger(parsedMaxUsage) || parsedMaxUsage <= 0) {
    throw new BadRequestException("maxUsage phải là số nguyên dương");
  }

  const from = new Date(validFrom);
  const to = new Date(validTo);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new BadRequestException("validFrom/validTo không hợp lệ");
  }
  if (to <= from) {
    throw new BadRequestException("validTo phải lớn hơn validFrom");
  }

  return {
    code: normalizedCode,
    discountType: normalizedDiscountType,
    discount: parsedDiscount,
    maxUsage: parsedMaxUsage,
    validFrom: from,
    validTo: to,
  };
};

const getCouponDiscountAmount = (coursePrice, coupon) => {
  const price = Number(coursePrice || 0);
  const discount = Number(coupon?.discount || 0);
  if (price <= 0 || discount <= 0) return 0;

  const discountType = normalizeCouponDiscountType(coupon?.discountType);
  if (discountType === "FIXED") {
    return Math.min(price, discount);
  }

  return Math.round(price * discount / 100);
};

const getValidCouponForCheckout = async ({ couponCode, coursePrice }) => {
  const code = normalizeCouponCode(couponCode);
  if (!code) return null;

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    throw new BadRequestException("Mã giảm giá không tồn tại");
  }

  const now = new Date();
  if (!coupon.isActive) {
    throw new BadRequestException("Mã giảm giá đã bị vô hiệu hóa");
  }
  if (now < coupon.validFrom || now > coupon.validTo) {
    throw new BadRequestException("Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng");
  }
  if (coupon.usedCount >= coupon.maxUsage) {
    throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
  }

  const discountAmount = getCouponDiscountAmount(coursePrice, coupon);
  return {
    coupon,
    discountAmount,
    finalAmount: Math.max(0, Number(coursePrice || 0) - discountAmount),
  };
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
  const parsedExtra = parseExtraData(payload.extraData);
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

    const couponCode = normalizeCouponCode(parsedExtra?.couponCode);
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
        select: { id: true, usedCount: true, maxUsage: true },
      });

      if (coupon && coupon.usedCount < coupon.maxUsage) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }
    }
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
  async createCoupon(payload) {
    const normalized = validateCouponInput(payload || {});

    const existed = await prisma.coupon.findUnique({
      where: { code: normalized.code },
      select: { id: true },
    });

    if (existed) {
      throw new BadRequestException("code đã tồn tại");
    }

    return prisma.coupon.create({
      data: {
        ...normalized,
        isActive: payload?.isActive !== undefined ? Boolean(payload.isActive) : true,
      },
    });
  },

  async updateCoupon(couponId, payload) {
    const existed = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existed) {
      throw new NotFoundException("Không tìm thấy mã giảm giá");
    }

    const data = {};
    if (payload.code !== undefined) data.code = normalizeCouponCode(payload.code);
    if (payload.discountType !== undefined) {
      data.discountType = normalizeCouponDiscountType(payload.discountType);
    }
    if (payload.discount !== undefined) {
      const discount = Number(payload.discount);
      const discountType = normalizeCouponDiscountType(data.discountType || existed.discountType);
      if (!Number.isInteger(discount) || discount <= 0) {
        throw new BadRequestException("discount phải là số nguyên dương");
      }
      if (discountType === "PERCENT" && discount > 100) {
        throw new BadRequestException("discount phải từ 1 đến 100 với kiểu PERCENT");
      }
      data.discount = discount;
    }
    if (payload.maxUsage !== undefined) {
      const maxUsage = Number(payload.maxUsage);
      if (!Number.isInteger(maxUsage) || maxUsage <= 0) {
        throw new BadRequestException("maxUsage phải là số nguyên dương");
      }
      data.maxUsage = maxUsage;
    }
    if (payload.validFrom !== undefined) {
      const validFrom = new Date(payload.validFrom);
      if (Number.isNaN(validFrom.getTime())) {
        throw new BadRequestException("validFrom không hợp lệ");
      }
      data.validFrom = validFrom;
    }
    if (payload.validTo !== undefined) {
      const validTo = new Date(payload.validTo);
      if (Number.isNaN(validTo.getTime())) {
        throw new BadRequestException("validTo không hợp lệ");
      }
      data.validTo = validTo;
    }
    if (payload.isActive !== undefined) {
      data.isActive = Boolean(payload.isActive);
    }

    const nextValidFrom = data.validFrom || existed.validFrom;
    const nextValidTo = data.validTo || existed.validTo;
    if (nextValidTo <= nextValidFrom) {
      throw new BadRequestException("validTo phải lớn hơn validFrom");
    }

    return prisma.coupon.update({
      where: { id: couponId },
      data,
    });
  },

  async deleteCoupon(couponId) {
    const existed = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existed) {
      throw new NotFoundException("Không tìm thấy mã giảm giá");
    }

    await prisma.coupon.delete({ where: { id: couponId } });
    return { couponId };
  },

  async getCoupons(query = {}) {
    const keyword = String(query.keyword || "").trim();
    const where = keyword
      ? {
          code: { contains: keyword, mode: "insensitive" },
        }
      : {};

    return prisma.coupon.findMany({
      where,
      orderBy: { validTo: "desc" },
    });
  },

  async validateCoupon({ couponCode, coursePrice }) {
    const normalizedPrice = Number(coursePrice || 0);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      throw new BadRequestException("Giá khóa học không hợp lệ để áp mã giảm giá");
    }

    const couponResult = await getValidCouponForCheckout({
      couponCode,
      coursePrice: normalizedPrice,
    });

    if (!couponResult) {
      return {
        couponCode: "",
        discountType: "PERCENT",
        discountValue: 0,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: normalizedPrice,
      };
    }

    return {
      couponCode: couponResult.coupon.code,
      discountType: normalizeCouponDiscountType(couponResult.coupon.discountType),
      discountValue: Number(couponResult.coupon.discount || 0),
      discountPercent:
        normalizeCouponDiscountType(couponResult.coupon.discountType) === "PERCENT"
          ? Number(couponResult.coupon.discount || 0)
          : 0,
      discountAmount: couponResult.discountAmount,
      finalAmount: couponResult.finalAmount,
    };
  },

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
