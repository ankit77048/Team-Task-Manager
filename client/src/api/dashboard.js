import api from './axios';

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export const usersAPI = {
  getAll: ()              => api.get('/users'),
  getById: (id)           => api.get(`/users/${id}`),
  getStats: (id)          => api.get(`/users/${id}/stats`),
  updateRole: (id, role)  => api.put(`/users/${id}/role`, { role }),
  deactivate: (id)        => api.delete(`/users/${id}`),
};
