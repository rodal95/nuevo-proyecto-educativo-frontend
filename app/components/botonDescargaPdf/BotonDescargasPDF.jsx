'use client';

// No necesitas apiClient aquí porque es un enlace simple (<a>), 
// el navegador se encarga de la petición GET.

// Este componente reutilizable genera el enlace de descarga del PDF.
const BotonDescargarPDF = ({ id, campo, label }) => {
  if (!id || !campo) {
    return null; // No renderizar si faltan props esenciales
  }

  // --- ¡ESTE ES EL CAMBIO CORRECTO! ---
  // La URL ahora apunta a tu API interna de Next.js.
  // Esta URL relativa funcionará tanto en desarrollo como en producción.
  // Por ejemplo, se convertirá en: /api/cursos/123/programa
  const pdfUrl = `/api/cursos/${id}/${campo}`;

  // Estilos básicos en línea para el botón, puedes usar CSS Modules si prefieres
  const buttonStyle = {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#1a237e', // Un azul oscuro que combine
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: '500',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={buttonStyle}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#283593'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a237e'}
    >
      {label || `Descargar ${campo}`}
    </a>
  );
};

export default BotonDescargarPDF;