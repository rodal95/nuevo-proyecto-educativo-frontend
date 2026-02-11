// frontend/app/cursos/_components/CursoCard.jsx

import Link from 'next/link';
import Image from 'next/image';
import styles from './cursoCard.module.css';
import DOMPurify from 'isomorphic-dompurify';

const transformarUrlsDeImagenes = (htmlContent, baseUrl) => {
  if (!htmlContent || !baseUrl) return htmlContent;
  const regex = /src="\/media\//g;
  return htmlContent.replace(regex, `src="${baseUrl}/media/`);
};

export default function CursoCard({ curso }) {
  // 1. Validamos si existe la imagen antes de construir la URL completa
  const tieneImagen = curso.imagen_portada !== null;
  const imagenUrl = tieneImagen 
    ? `${process.env.NEXT_PUBLIC_API_URL}${curso.imagen_portada}` 
    : null;

  const descripcionCorregida = transformarUrlsDeImagenes(
    curso.descripcion,
    process.env.NEXT_PUBLIC_API_URL
  );

  return (
    <Link href={`/cursos/${curso.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {/* 2. CORRECCIÓN: Si tiene imagen, la mostramos; si no, el placeholder */}
        
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{curso.titulo}</h3>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descripcionCorregida) }}
        />
      </div>
    </Link>
  );
}