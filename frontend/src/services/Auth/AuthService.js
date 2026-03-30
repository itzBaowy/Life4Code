import api from '../../configs/axiosConfig';

export const loginService = async (data) => {
    return api.post('/api/auth/login', data);
};
