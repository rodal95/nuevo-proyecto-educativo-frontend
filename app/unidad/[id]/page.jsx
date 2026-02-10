'use client'; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './unidad.module.css';
import { fetchUnidadById } from '@/app/lib/apiUnidades';
import DOMPurify from 'isomorphic-dompurify';

export default function UnidadDetailPage() {
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const params = useParams();
  const { id } = params; // Este es el ID de la UNIDAD

  useEffect(() => {
    if (id) {
      fetchUnidadById(id)
        .then(data => {
          setUnidad(data);
          console.log(data); // El console.log que tenías para depurar
        })
        .catch(err => {
          setError('No se pudo encontrar el contenido de esta unidad.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando unidad...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!unidad) return null;

  // URL base de tu backend de Django. Ajústala si es necesario.
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href={`/cursos/${unidad.curso}`}>Volver al curso</Link>
      </nav>

      <header className={styles.header}>
        <span className={styles.numeroUnidad}>Unidad {unidad.orden}</span>
        <h1 className={styles.title}>{unidad.titulo}</h1>
      </header>
      
      {/* --- SECCIÓN PARA LA DESCRIPCIÓN DE LA UNIDAD --- */}
      {unidad.descripcion && (
        <article className={styles.descripcionUnidad}>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(unidad.descripcion) }} />
        </article>
      )}

      {/* --- SECCIÓN PARA LA LISTA DE CLASES DE LA UNIDAD --- */}
        <section className={styles.clasesSection}>
          <h2 className={styles.sectionTitle}>Clases de esta Unidad</h2>
          <div className={styles.clasesList}>
            {unidad.clases && unidad.clases.length > 0 ? (
              unidad.clases
                .sort((a, b) => a.numero_clase - b.numero_clase) // Ordenar por numero_clase
                .map(clase => (
                  <Link 
                    href={`/clase/${clase.id}`} // Ruta a la futura página de detalle de la clase
                    key={clase.id} 
                    className={styles.claseItem}
                  >
                    <div className={styles.claseNumero}>{clase.numero_clase}</div>
                    <div className={styles.claseTitulo}>{clase.titulo}</div>
                    <div className={styles.claseIcon}>➔</div>
                  </Link>
                ))
            ) : (
              <p className={styles.noClases}>Aún no hay clases en esta unidad.</p>
            )}
          </div>
        </section>

      {/* --- (NUEVO) SECCIÓN PARA LOS TRABAJOS PRÁCTICOS --- */}
      <section className={styles.trabajosPracticosSection}>
        <h2 className={styles.sectionTitle}>Trabajos Prácticos</h2>
        <div className={styles.trabajosPracticosList}>
          {unidad.trabajos_practicos && unidad.trabajos_practicos.length > 0 ? (
            unidad.trabajos_practicos.map(tp => (
              <div key={tp.id} className={styles.tpItem}>
                <div className={styles.tpInfo}>
                  <span className={styles.tpTitulo}>{tp.titulo}</span><br/>
                  <div className={styles.tpDescripcion} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tp.enunciado) }} />
                </div>
                <a 
                  href={`/api/trabajos/${tp.id}`}
                  className={styles.tpPdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver Trabajo Práctico en PDF"
                >
                  Ver PDF 📄
                </a>
              </div>
            ))
          ) : (
            <p className={styles.noItems}>Aún no hay trabajos prácticos en esta unidad.</p>
          )}
        </div>
      </section>
    </div>
  );
}
