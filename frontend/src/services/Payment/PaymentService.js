import api from '../../configs/axiosConfig';

export const createMomoPaymentUrlService = (courseId) =>
    api.post('/api/payment/momo/create-url', { courseId });
