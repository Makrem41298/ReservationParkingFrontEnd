import api from '../../services/api';

export const planParkingLotAPI = {
  create: (data) => api.post('/plan-parking-lot', data),
  getAll: () => api.get('/plan-parking-lot'),
  getById: (id) => api.get(`/plan-parking-lot/${id}`),
  update: (id, data) => api.put(`/plan-parking-lot/${id}`, data),
  delete: (id) => api.delete(`/plan-parking-lot/${id}`),
};
