// app/api/clases/[id]/[campo]/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

export async function GET(request, { params }) {
  const { id, campo } = await  params;

  // Validamos que el campo sea uno de los que pueden generar PDF
  const camposPermitidos = ['contenido', 'actividad_en_clase'];
  if (!camposPermitidos.includes(campo)) {
    return NextResponse.json({ error: 'Campo no válido para generar PDF' }, { status: 400 });
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // URL dinámica que apunta al endpoint de PDF de Django para clases
  const djangoPdfUrl = `/api/clases/clase/${id}/pdf/${campo}/`;

  try {
    // 1. Primer intento de obtener el archivo PDF
    const djangoResponse = await djangoApi.get(djangoPdfUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      responseType: 'arraybuffer', // Crucial para manejar archivos
    });

    return new NextResponse(djangoResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${campo}_clase_${id}.pdf"`,
      },
    });

  } catch (error) {
    // 2. Lógica para refrescar el token si está expirado
    if (error.response?.status === 401) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.json({ error: 'Sesión expirada.' }, { status: 401 });
      }

      try {
        const refreshResponse = await djangoApi.post('/api/token/refresh/', { refresh: refreshToken });
        const newAccessToken = refreshResponse.data.access;

        // 3. Reintento con el nuevo token
        const retryResponse = await djangoApi.get(djangoPdfUrl, {
            headers: { 'Authorization': `Bearer ${newAccessToken}` },
            responseType: 'arraybuffer',
        });
        
        const response = new NextResponse(retryResponse.data, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${campo}_clase_${id}.pdf"`,
            },
        });

        // 4. Actualizamos la cookie del token de acceso
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60, // 1 hora
            path: '/',
            sameSite: 'strict',
        });
        return response;

      } catch (refreshError) {
        // El refresh token falló, la sesión es inválida
        const response = NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }
    
    // Manejo de otros errores
    return NextResponse.json(
      { error: 'No se pudo generar el PDF.' },
      { status: error.response?.status || 500 }
    );
  }
}