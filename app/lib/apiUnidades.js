import apiClient from './axiosInstance'; // Importa la instancia

export function fetchUnidadById(id) {
  return apiClient.get(`/api/unidades/${id}`).then(response => response.data);
}