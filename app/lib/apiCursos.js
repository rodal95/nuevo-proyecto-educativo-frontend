import apiClient from './axiosInstance'; // Importa la instancia

export function fetchCursos() {
  return apiClient.get('/api/cursos')
    .then(response => response.data)
    .catch(error => {
      console.error('Error al obtener los cursos:', error);
      throw error;
    });
}

export function fetchCursoById(id){
    return apiClient.get(`/api/cursos/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error al obtener el curso:', error);
        throw error;
      });
}

export function fetchCursoPrograma(id) {
    return apiClient.get(`/api/cursos/${id}/programa`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error al obtener el programa del curso:', error);
        throw error;
      });
}