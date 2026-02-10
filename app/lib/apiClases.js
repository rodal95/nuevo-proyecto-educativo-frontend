import apiClient from './axiosInstance'; // Importa la instancia


export function fetchClaseById(id) {
  return apiClient.get(`/api/clases/${id}`).then(response => response.data);
}

export function fetchPdfClase(id, campo) {
  return apiClient.get(`/api/clases/${id}/${campo}`).then(response => response.data);
}