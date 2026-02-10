// frontend/app/page.js

import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { BookOpen, Users, Video } from 'lucide-react'; // Importamos los iconos

export default function Home() {
  return (
    <main className={styles.main}>
      {/* --- SECCIÓN HERO --- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>
            Transforma tu futuro. Aprende sin límites.
          </h1>
          <p className={styles.subheadline}>
            Accede a cursos de alta calidad impartidos por expertos de la industria y alcanza tus metas profesionales desde hoy.
          </p>
          <Link href="/cursos" className={styles.ctaButton}>
            Explorar Cursos
          </Link>
        </div>
        <div className={styles.heroImageContainer}>
          <Image
            src="https://placehold.co/800x600/e2e8f0/4a5568?text=Plataforma+Educativa"
            alt="Estudiante aprendiendo en línea"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      {/* --- SECCIÓN DE CARACTERÍSTICAS --- */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir nuestra plataforma?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <BookOpen size={48} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Contenido de Expertos</h3>
            <p className={styles.featureDescription}>
              Aprende de profesionales con años de experiencia en el campo, con contenido actualizado y relevante.
            </p>
          </div>
          <div className={styles.featureCard}>
            <Video size={48} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Aprendizaje Interactivo</h3>
            <p className={styles.featureDescription}>
              Participa en clases dinámicas, proyectos prácticos y evaluaciones que refuerzan tu conocimiento.
            </p>
          </div>
          <div className={styles.featureCard}>
            <Users size={48} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Comunidad y Soporte</h3>
            <p className={styles.featureDescription}>
              Conéctate con otros estudiantes y recibe soporte de instructores para resolver todas tus dudas.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN FINAL DE LLAMADA A LA ACCIÓN --- */}
      <section className={styles.finalCta}>
        <h2 className={styles.sectionTitle}>¿Listo para empezar a aprender?</h2>
        <p className={styles.subheadline}>
          Tu próximo gran paso profesional está a solo un clic de distancia.
        </p>
        <Link href="/cursos" className={styles.ctaButton}>
          Ver todos los cursos
        </Link>
      </section>
    </main>
  );
}
