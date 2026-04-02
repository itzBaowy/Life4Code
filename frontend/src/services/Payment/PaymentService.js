import api from '../../configs/axiosConfig';

export const createMomoPaymentUrlService = (courseId, couponCode) =>
    api.post('/api/payment/momo/create-url', {
        courseId,
        couponCode: String(couponCode || '').trim() || undefined,
    });
