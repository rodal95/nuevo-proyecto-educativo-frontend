// lib/djangoApiClient.js
import axios from 'axios';

const djangoApi = axios.create({
  baseURL: process.env.DJANGO_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Opcional: la petición fallará si tarda más de 10 segundos
});

// Aquí es donde en un futuro podrías añadir los interceptors
// djangoApi.interceptors.response.use( ... Lógica de refresco de token ... );

export default djangoApi;