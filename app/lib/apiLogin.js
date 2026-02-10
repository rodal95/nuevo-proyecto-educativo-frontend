// lib/apiLogin.js
import apiClient from './axiosInstance'; // Importa la instancia

export async function loginUser(username, password) {
  try {
    await apiClient.post('/api/login', { username, password });
    return { success: true };
  } catch (error) {
    console.error('Error de login con Axios:', error);
    const errorMessage = error.response?.data?.error || 'Credenciales inválidas o error del servidor.';
    return { success: false, error: errorMessage };
  }
}