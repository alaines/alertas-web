// src/api/axios.config.ts
import axios from 'axios';
import authService from '../services/auth.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.18.230/api/v1',
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (no autenticado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
