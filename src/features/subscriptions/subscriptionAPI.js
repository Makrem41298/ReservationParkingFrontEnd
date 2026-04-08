import api from '../../services/api';

export const subscriptionAPI = {
  create: (data) => api.post('/subscriptions', data),
  getAll: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
};
