import { NextResponse } from 'next/server';

// Esta función maneja las peticiones GET a /api/trabajos/[id]
export async function GET(request, { params }) {
  // Obtenemos el ID del trabajo práctico desde la URL
  const { id } = await params;

  // URL base de tu backend de Django. Es recomendable usar variables de entorno.
  const djangoApiUrl = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';
  
  // Construimos la URL completa para solicitar el PDF a Django
  const pdfUrl = `${djangoApiUrl}/api/trabajosPracticos/tp/${id}/pdf/`;

  try {
    // Hacemos la petición a nuestro backend de Django
    const djangoResponse = await fetch(pdfUrl);

    // Si Django no responde correctamente (ej. error 404 o 500),
    // devolvemos un error al cliente.
    if (!djangoResponse.ok) {
      throw new Error(`Error al obtener el PDF desde Django: ${djangoResponse.statusText}`);
    }

    // Obtenemos el contenido del PDF como un Blob (Binary Large Object)
    const pdfBlob = await djangoResponse.blob();

    // Creamos una nueva respuesta para enviar al cliente.
    // Le pasamos el contenido del PDF (el blob) y configuramos las cabeceras
    // para que el navegador sepa que es un archivo PDF.
    return new Response(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // Esta cabecera sugiere al navegador cómo mostrar el archivo.
        // 'inline' intenta mostrarlo en el navegador. 'attachment' forzaría la descarga.
        'Content-Disposition': `inline; filename="trabajo_practico_${id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error en la API Route de Next.js:', error);
    // Si algo falla, devolvemos una respuesta de error en formato JSON
    return NextResponse.json(
      { message: 'No se pudo generar el PDF.' },
      { status: 500 }
    );
  }
}