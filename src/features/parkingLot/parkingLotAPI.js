import api from '../../services/api';

const buildFormData = (data, imageFile) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
};

export const parkingLotAPI = {
  create: (data, imageFile) => {
    const formData = buildFormData(data, imageFile);
    return api.post('/parking-lot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/parking-lot'),
  getById: (id) => api.get(`/parking-lot/${id}`),
  update: (id, data, imageFile) => {
    const formData = buildFormData(data, imageFile);
    return api.put(`/parking-lot/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/parking-lot/${id}`),
};
