// app/cursos/page.jsx (Versión Client Component)
'use client'; // <-- Esto lo convierte en un Client Component

import { useState, useEffect } from 'react';
import styles from './cursos.module.css';
import CursoCard from '@/app/components/cursoCard/CursoCard'; // Asegúrate de que la ruta sea correcta
// 1. Importas tu función de la capa de API
import { fetchCursos } from '@/app/lib/apiCursos'; // Asumiendo que has renombrado el archivo

export default function CursosPage() {
  // 2. Necesitas estados para los datos, la carga y los errores
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Usas useEffect para obtener los datos en el cliente
  useEffect(() => {
    fetchCursos()
      .then(data => {
        setCursos(data);
        console.log(data)
      })
      .catch(err => {
        setError('No se pudieron cargar los cursos.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // El array vacío asegura que se ejecute solo una vez

  // 4. Renderizas la UI según el estado
  if (isLoading) {
    return <p>Cargando cursos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Explora los Cursos</h1>
      </header>
      <main className={styles.cursosGrid}>
        {cursos.map((curso) => (
          <CursoCard key={curso.id} curso={curso} />
        ))}
      </main>
    </div>
  );
}