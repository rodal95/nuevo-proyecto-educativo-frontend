// frontend/app/cursos/_components/CursoCard.jsx

import Link from 'next/link';
import Image from 'next/image';
import styles from './cursoCard.module.css';
import DOMPurify from 'isomorphic-dompurify';

// --- SOLUCIÓN 1: AÑADIMOS LA MISMA FUNCIÓN AUXILIAR ---
// Esta función corregirá las URLs de las imágenes dentro del HTML de la descripción.
const transformarUrlsDeImagenes = (htmlContent, baseUrl) => {
  if (!htmlContent || !baseUrl) {
    return htmlContent;
  }
  const regex = /src="\/media\//g;
  return htmlContent.replace(regex, `src="${baseUrl}/media/`);
};


export default function CursoCard({ curso }) {
  // Construimos la URL para la imagen de portada
  const imagenUrl = `${process.env.NEXT_PUBLIC_API_URL}${curso.imagen_portada}`;

  // --- Corregimos el HTML de la descripción ANTES de renderizarlo ---
  const descripcionCorregida = transformarUrlsDeImagenes(
    curso.descripcion,
    process.env.NEXT_PUBLIC_API_URL
  );

  return (
    <Link href={`/cursos/${curso.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={curso.imagen_portada ? imagenUrl : '/default-course-image.png'}
          alt={`Portada del curso ${curso.titulo}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
          unoptimized // <-- SOLUCIÓN 2: AÑADIMOS ESTA PROPIEDAD
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{curso.titulo}</h3>

        {/* Usamos la descripción ya corregida y sanitizada */}
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descripcionCorregida) }}
        />
        
      </div>
    </Link>
  );
}
