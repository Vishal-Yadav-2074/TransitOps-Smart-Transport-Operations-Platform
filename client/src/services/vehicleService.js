import api from './api';

const vehicleService = {
  // Vehicle CRUD
  getAll: async () => {
    const res = await api.get('/vehicles');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/vehicles', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },

  // Maintenance Sub-routes
  getAllMaintenances: async () => {
    const res = await api.get('/maintenances');
    return res.data;
  },
  createMaintenance: async (data) => {
    const res = await api.post('/maintenances', data);
    return res.data;
  },
  updateMaintenance: async (id, data) => {
    const res = await api.put(`/maintenances/${id}`, data);
    return res.data;
  },
  deleteMaintenance: async (id) => {
    const res = await api.delete(`/maintenances/${id}`);
    return res.data;
  },

  // Expense Sub-routes
  getAllExpenses: async () => {
    const res = await api.get('/expenses');
    return res.data;
  },
  createExpense: async (data) => {
    const res = await api.post('/expenses', data);
    return res.data;
  },
  updateExpense: async (id, data) => {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },
  deleteExpense: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  }
};

export default vehicleService;
