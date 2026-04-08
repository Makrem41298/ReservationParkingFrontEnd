import api from '../../services/api';

export const parkingLotAPI = {
  create: (data) => api.post('/parking-lot', data),
  getAll: () => api.get('/parking-lot'),
  getById: (id) => api.get(`/parking-lot/${id}`),
  update: (id, data) => api.put(`/parking-lot/${id}`, data),
  delete: (id) => api.delete(`/parking-lot/${id}`),
};
