import api from '../../services/api';

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateStatusUser: (id, data) => api.put(`/users/${id}`, data),
};
