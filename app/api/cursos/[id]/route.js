// Archivo: app/api/mis-cursos/[id]/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

// La función ahora recibe 'params' para acceder al ID de la URL.
export async function GET(request, { params }) {
  // Obtenemos el ID específico del curso desde los parámetros de la URL.
  const { id } = await params;

  // 1. OBTENER COOKIES Y TOKEN DE ACCESO (Lógica idéntica)
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado: Token no encontrado.' }, { status: 401 });
  }

  try {
    // 2. PRIMER INTENTO: Intentamos obtener el detalle del curso específico.
    // --- ÚNICO CAMBIO IMPORTANTE ---
    // Usamos el `id` para construir la URL que apunta al detalle en Django.
    const djangoResponse = await djangoApi.get(`/api/cursos/mis-cursos/${id}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return NextResponse.json(djangoResponse.data);

  } catch (error) {
    // 3. MANEJO DE ERROR Y LÓGICA DE REFRESCO (Idéntica a la anterior)
    if (error.response?.status === 401) {
      console.log(`Access token expirado para el curso ${id}. Intentando refrescar...`);
      const refreshToken = cookieStore.get('refreshToken')?.value;

      if (!refreshToken) {
        return NextResponse.json({ error: 'Sesión expirada.' }, { status: 401 });
      }

      try {
        // 4. LÓGICA DE REFRESCO
        const refreshResponse = await djangoApi.post('/api/token/refresh/', {
          refresh: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.access;

        // 5. REINTENTO: Volvemos a hacer la petición original para el detalle.
        // --- ÚNICO CAMBIO IMPORTANTE ---
        const retryResponse = await djangoApi.get(`/api/cursos/mis-cursos/${id}/`, {
            headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });
        
        // 6. RESPUESTA EXITOSA FINAL
        const response = NextResponse.json(retryResponse.data);
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60,
            path: '/',
            sameSite: 'strict',
        });
        return response;

      } catch (refreshError) {
        // 7. FALLO TOTAL
        console.error('Refresh token inválido. La sesión ha terminado.');
        const response = NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }
    
    console.error(`Error al obtener el detalle del curso ${id}:`, error.response?.data);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor.' },
      { status: error.response?.status || 500 }
    );
  }
}