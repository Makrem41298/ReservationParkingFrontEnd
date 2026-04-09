import api from '../../services/api';

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  updateStatusUser: (id, data) => api.put(`/users/${id}`, data),
  createAdmin: (data) => api.post('/users', data),
};
