import api from './api';

const tripService = {
  getAll: async () => {
    const res = await api.get('/trips');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/trips/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/trips', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/trips/${id}`, data);
    return res.data;
  },
  dispatch: async (id) => {
    const res = await api.post(`/trips/${id}/dispatch`);
    return res.data;
  },
  complete: async (id) => {
    const res = await api.post(`/trips/${id}/complete`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.post(`/trips/${id}/cancel`);
    return res.data;
  }
};

export default tripService;
