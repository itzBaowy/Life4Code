import api from '../../configs/axiosConfig';

export const loginService = async (data) => {
    return api.post('/auth/login', data);
};
