// lib/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
  // No necesitamos una baseURL aquí porque llamamos a nuestras propias API Routes relativas.
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;