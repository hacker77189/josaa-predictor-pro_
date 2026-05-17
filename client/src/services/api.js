import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getFilters = async () => {
  const response = await api.get('/filters');
  return response.data;
};

export const getPredictions = async (params) => {
  const response = await api.get('/predict', { params });
  return response.data;
};

export const getCollege = async (id) => {
  const response = await api.get(`/colleges/${id}`);
  return response.data;
};

export const getAllColleges = async () => {
  const response = await api.get('/colleges');
  return response.data;
};

export default api;
