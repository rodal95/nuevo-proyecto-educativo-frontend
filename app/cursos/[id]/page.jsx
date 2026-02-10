'use client'; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './detail.module.css';
import { fetchCursoById } from '@/app/lib/apiCursos';
import DOMPurify from 'isomorphic-dompurify';
import BotonDescargarPDF from '@/app/components/botonDescargaPdf/BotonDescargasPDF';

export default function CursoDetailPage() {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('descripcion');
  
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchCursoById(id)
        .then(data => {
          setCurso(data);
        })
        .catch(err => {
          setError('No se pudo encontrar el curso o hubo un error al cargarlo.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando información del curso...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!curso) return null;

  const imagenUrl = `${process.env.NEXT_PUBLIC_API_URL}${curso.imagen_portada}`;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/cursos">← Volver a todos los cursos</Link>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{curso.titulo}</h1>
        <div className={styles.profesores}>
          <span>Impartido por: </span>
          {curso.profesores?.map(profesor => `${profesor.username || ''} `.trim()).join(', ') || 'Profesor no asignado'}
        </div>
      </header>
      
      <main className={styles.mainContent}>
        <div className={styles.imageWrapper}>
          <Image
            src={imagenUrl}
            alt={`Portada de ${curso.titulo}`}
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
            className={styles.image}
            priority
            unoptimized // <-- ¡ESTA ES LA SOLUCIÓN!
          />
        </div>
        
        <aside className={styles.sidebar}>
            {curso.unidades && curso.unidades.length > 0 && (
              <div className={styles.unidadesSection}>
                <h3 className={styles.unidadesTitle}>Contenido del Curso</h3>
                <ul className={styles.unidadesList}>
                  {curso.unidades.map(unidad => (
                    <li key={unidad.id}>
                      <Link 
                        href={`/unidad/${unidad.id}`} 
                        className={styles.unidadItem}
                      >
                        <span className={styles.unidadOrden}>{`Unidad ${unidad.orden}`}</span>
                        <span className={styles.unidadTitulo}>{unidad.titulo}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </aside>
      </main>

      {/* ... El resto de tu componente (sección de TABS) sigue igual ... */}
      <section className={styles.tabsContainer}>
        <nav className={styles.tabButtons}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'descripcion' ? styles.active : ''}`}
            onClick={() => setActiveTab('descripcion')}>
            Descripción
          </button>
          {curso.programa && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'programa' ? styles.active : ''}`}
              onClick={() => setActiveTab('programa')}>
              Programa
            </button>
          )}
          {curso.rubrica && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'rubrica' ? styles.active : ''}`}
              onClick={() => setActiveTab('rubrica')}>
              Rúbrica
            </button>
          )}
        </nav>

        <article className={styles.tabContent}>
          {activeTab === 'descripcion' && (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(curso.descripcion) }} />
          )}

          {activeTab === 'programa' && curso.programa && (
            <div>
              <div className={styles.tabHeader}>
                <BotonDescargarPDF 
                  id={curso.id}
                  campo="programa" 
                  label="Descargar Programa en PDF"
                />
              </div>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(curso.programa) }} />
            </div>
          )}

          {activeTab === 'rubrica' && curso.rubrica && (
            <div>
              <div className={styles.tabHeader}>
                <BotonDescargarPDF 
                  id={curso.id}
                  campo="rubrica" 
                  label="Descargar Rúbrica en PDF"
                />
              </div>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(curso.rubrica) }} />
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
