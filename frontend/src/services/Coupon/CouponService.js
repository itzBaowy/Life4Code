import api from '../../configs/axiosConfig';

export const validateCouponService = (payload) =>
    api.post('/api/payment/coupon/validate', payload);

export const getCouponsService = (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', String(params.keyword));

    const queryString = query.toString();
    return api.get(`/api/payment/coupon${queryString ? `?${queryString}` : ''}`);
};

export const createCouponService = (payload) =>
    api.post('/api/payment/coupon', payload);

export const updateCouponService = (couponId, payload) =>
    api.patch(`/api/payment/coupon/${couponId}`, payload);

export const deleteCouponService = (couponId) =>
    api.delete(`/api/payment/coupon/${couponId}`);
