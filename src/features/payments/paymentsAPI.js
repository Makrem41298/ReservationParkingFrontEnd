import api from '../../services/api';

export const paymentsAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  getByReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
  requestRefund: (id) => api.post(`/transactions/${id}/refund-request`),
  approveRefund: (id) => api.post(`/transactions/${id}/refund-approve`),
  rejectRefund: (id) => api.post(`/transactions/${id}/refund-reject`),
};
