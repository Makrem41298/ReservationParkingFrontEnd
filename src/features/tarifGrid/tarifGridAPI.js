import api from '../../services/api';

export const tarifGridAPI = {
  create: (data) => api.post('/tarif-grid', data),
  getAll: () => api.get('/tarif-grid'),
  getById: (id) => api.get(`/tarif-grid/${id}`),
  update: (id, data) => api.put(`/tarif-grid/${id}`, data),
  delete: (id) => api.delete(`/tarif-grid/${id}`),
};
