'use client';

// Este componente reutilizable genera el enlace de descarga del PDF para una clase.
const BotonContenidoPdf = ({ id, campo, label }) => {
  // No renderizar si faltan props esenciales para construir la URL.
  if (!id || !campo) {
    return null;
  }

  // La URL ahora apunta a tu API interna de Next.js para las clases.
  // Ejemplo: /api/clases/42/contenido
  const pdfUrl = `/api/clases/${id}/${campo}`;

  // Estilos para el botón. Puedes moverlos a un archivo CSS si lo prefieres.
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

export default BotonContenidoPdf;
