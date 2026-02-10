// frontend/app/clase/[id]/page.js

'use client'; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './clase.module.css';
import { fetchClaseById } from '@/app/lib/apiClases';
import DOMPurify from 'isomorphic-dompurify';
import BotonContenidoPdf from '@/app/components/botonContenidoPdf/BotonContenidoPdf';

// --- ESTA FUNCIÓN ES LA SOLUCIÓN CORRECTA ---
const transformarUrlsDeImagenes = (htmlContent, baseUrl) => {
  if (!htmlContent || !baseUrl) {
    return htmlContent;
  }
  // Busca todas las 'src="/media/...' y les antepone la URL del backend
  const regex = /src="\/media\//g;
  return htmlContent.replace(regex, `src="${baseUrl}/media/`);
};

export default function ClaseDetailPage() {
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('contenido');
  
  const params = useParams();
  const { id } = params; 

  // Obtenemos la URL base de nuestro backend desde las variables de entorno
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id) {
      fetchClaseById(id)
        .then(data => {
          setClase(data);
        })
        .catch(err => {
          setError('No se pudo cargar el contenido de esta clase.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando clase...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!clase) return null;

  // --- TRANSFORMAMOS EL CONTENIDO ANTES DE RENDERIZAR ---
  const contenidoCorregido = transformarUrlsDeImagenes(clase.contenido, apiBaseUrl);
  const actividadCorregida = transformarUrlsDeImagenes(clase.actividad_en_clase, apiBaseUrl);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <span className={styles.separator}>/</span>
        <Link href={`/unidad/${clase.unidad}`}>Volver a la unidad</Link>
      </nav>

      <header className={styles.header}>
        <span className={styles.numeroClase}>Clase {clase.numero_clase}</span>
        <h1 className={styles.title}>{clase.titulo}</h1>
      </header>
      
      <section className={styles.tabsContainer}>
        <nav className={styles.tabButtons}>
          {clase.contenido && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'contenido' ? styles.active : ''}`}
              onClick={() => setActiveTab('contenido')}>
              Contenido
            </button>
          )}
          {clase.actividad_en_clase && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'actividad' ? styles.active : ''}`}
              onClick={() => setActiveTab('actividad')}>
              Actividad en Clase
            </button>
          )}
        </nav>

        <article className={styles.tabContent}>
          {activeTab === 'contenido' && clase.contenido && (
            <div className={styles.contenido}>
              <BotonContenidoPdf id={clase.id} campo="contenido" />
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contenidoCorregido) }} />
            </div>
          )}
          {activeTab === 'actividad' && clase.actividad_en_clase && (
            <div className={styles.actividad}>
              <BotonContenidoPdf id={clase.id} campo="actividad_en_clase" />
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(actividadCorregida) }} />
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
