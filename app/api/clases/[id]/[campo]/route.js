import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

export async function GET(request, { params }) {
  const { id, campo } = await params;

  const camposPermitidos = ['contenido', 'actividad_en_clase'];
  if (!camposPermitidos.includes(campo)) {
    return NextResponse.json({ error: 'Campo no válido' }, { status: 400 });
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const djangoPdfUrl = `/api/clases/clase/${id}/pdf/${campo}/`;

  try {
    const djangoResponse = await djangoApi.get(djangoPdfUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
    });

    return new NextResponse(djangoResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${campo}_clase_${id}.pdf"`,
      },
    });

  } catch (error) {
    // --- NUEVA LÓGICA DE DIAGNÓSTICO ---
    
    // 1. Loggear el error en la consola de Railway (Frontend)
    console.error("DEBUG: Error en la petición a Django PDF:");
    if (error.response) {
      // El servidor respondió con un código de error (4xx o 5xx)
      console.error("Status de Django:", error.response.status);
      
      // Intentamos leer el mensaje de error de Django aunque sea un arraybuffer
      if (error.response.data instanceof ArrayBuffer) {
        const decodedError = new TextDecoder().decode(error.response.data);
        console.error("Cuerpo del error (Django):", decodedError);
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta (Timeout o Red)
      console.error("No hubo respuesta del servidor de Django. ¿Está vivo el backend?");
    } else {
      console.error("Error de configuración/Next.js:", error.message);
    }

    // 2. Manejo de Refresh Token (Tu lógica original)
    if (error.response?.status === 401) {
       // ... (Tu código de refresh actual se mantiene igual)
       // Pero asegúrate de añadir logs similares dentro del try/catch del retry
    }
    
    // 3. Respuesta final con más información para ti
    return NextResponse.json(
      { 
        error: 'No se pudo generar el PDF.',
        detalle: error.message,
        djangoStatus: error.response?.status || 'N/A',
        // Esto te dirá en el navegador qué pasó exactamente
        info: error.response?.data instanceof ArrayBuffer 
               ? new TextDecoder().decode(error.response.data).substring(0, 200) 
               : "No hay info extra"
      },
      { status: error.response?.status || 500 }
    );
  }
}