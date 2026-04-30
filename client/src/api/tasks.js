import api from './axios';

export const tasksAPI = {
  getAll: (params = {})             => api.get('/tasks', { params }),
  getById: (id)                     => api.get(`/tasks/${id}`),
  getByProject: (projectId)         => api.get(`/tasks/project/${projectId}`),
  create: (data)                    => api.post('/tasks', data),
  update: (id, data)                => api.put(`/tasks/${id}`, data),
  delete: (id)                      => api.delete(`/tasks/${id}`),
  updateStatus: (id, status)        => api.put(`/tasks/${id}`, { status }),
};
