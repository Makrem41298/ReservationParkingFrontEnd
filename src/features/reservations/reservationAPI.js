import api from '../../services/api';

export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  update: (id, data) => api.put(`/reservations/${id}`, data),
};
