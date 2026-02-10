// Archivo: app/api/unidades/[id]/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

/**
 * Obtiene el detalle de una UNIDAD específica por su ID.
 * Esta es una ruta protegida y requiere autenticación.
 */
export async function GET(request, { params }) {
  // Obtenemos el ID de la unidad desde los parámetros de la URL.
  const { id } =await params;

  // 1. OBTENER COOKIES Y TOKEN DE ACCESO (Lógica idéntica)
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado: Token no encontrado.' }, { status: 401 });
  }

  // Construimos la URL del endpoint de Django para una unidad específica.
  const djangoUrl = `/api/unidades/unidad/${id}/`;

  try {
    // 2. PRIMER INTENTO: Intentamos obtener el detalle de la unidad.
    const djangoResponse = await djangoApi.get(djangoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return NextResponse.json(djangoResponse.data);

  } catch (error) {
    // 3. MANEJO DE ERROR Y LÓGICA DE REFRESCO
    if (error.response?.status === 401) {
      console.log(`Access token expirado para la unidad ${id}. Intentando refrescar...`);
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

        // 5. REINTENTO: Volvemos a hacer la petición original para el detalle de la unidad.
        const retryResponse = await djangoApi.get(djangoUrl, {
            headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });
        
        // 6. RESPUESTA EXITOSA FINAL
        const response = NextResponse.json(retryResponse.data);
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60, // 1 hora
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
    
    console.error(`Error al obtener el detalle de la unidad ${id}:`, error.response?.data);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor.' },
      { status: error.response?.status || 500 }
    );
  }
}