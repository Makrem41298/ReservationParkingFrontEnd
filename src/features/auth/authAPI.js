import api from '../../services/api';

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  refreshToken: () => api.post('/refresh'),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  changePassword: (data) => api.put('/change-password', data),
};
