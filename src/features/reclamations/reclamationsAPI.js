import api from '../../services/api';

export const reclamationsAPI = {
  getAll: () => api.get('/reclamations'),

  getById: (id) => api.get(`/reclamation/${id}`),

  create: (data) => api.post('/reclamation', data),

  update: (id, data) => api.put(`/reclamation/${id}`, data),
  delete: (id) => api.delete(`/reclamation/${id}`),


  sendMessageAgent: (data) => api.post(`/agent`, data),
  sendMessageClientAgent: (data) => api.post(`/agent-client`, data),
  sendMessageAnonymousAgent: (data) => api.post(`/agent-anonymous`, data),

};
