import api from '../../services/api';

export const reclamationsAPI = {
  // Get all reclamations
  getAll: () => api.get('/reclamations'),

  // Get a single reclamation by ID
  getById: (id) => api.get(`/reclamation/${id}`),

  // Create a new reclamation (typically by CLIENT)
  create: (data) => api.post('/reclamation', data),

  // Update a reclamation (Admin responding, or Client modifying)
  // Admin updating: { solution, status }
  update: (id, data) => api.put(`/reclamation/${id}`, data),

  // Delete a reclamation
  delete: (id) => api.delete(`/reclamation/${id}`),


  sendMessageAgent: (data) => api.post(`/agent`, data),
};
