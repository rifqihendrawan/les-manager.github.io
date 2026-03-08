import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const studentAPI = {
  getAll: () => axios.get(`${API_URL}/students`),
  create: (data) => axios.post(`${API_URL}/students`, data),
  update: (id, data) => axios.put(`${API_URL}/students/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/students/${id}`),
  togglePertemuan: (id, nomor) => axios.patch(`${API_URL}/students/${id}/pertemuan/${nomor}`),
  updateCatatan: (id, nomor, catatan) => axios.patch(`${API_URL}/students/${id}/pertemuan/${nomor}/catatan`, { catatan }),
};

export const dashboardAPI = {
  getStats: () => axios.get(`${API_URL}/dashboard`),
};
