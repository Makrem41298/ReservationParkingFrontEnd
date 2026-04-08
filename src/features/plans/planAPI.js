import api from '../../services/api';

export const planAPI = {
  create: (data) => api.post('/plans', data),
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};
