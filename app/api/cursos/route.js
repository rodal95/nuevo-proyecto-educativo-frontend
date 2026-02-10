import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // 1. PRIMER INTENTO: Hacemos la llamada a Django con el token que tenemos.
    const djangoResponse = await djangoApi.get('/api/cursos/mis-cursos/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Si todo va bien, devolvemos los datos.
    return NextResponse.json(djangoResponse.data);

  } catch (error) {
    // 2. SI FALLA, comprobamos si es un error 401 (Token inválido/expirado).
    if (error.response?.status === 401) {
      console.log('Access token posiblemente expirado. Intentando refrescar...');
      const refreshToken = cookieStore.get('refreshToken')?.value;

      if (!refreshToken) {
        // Si no hay refresh token, no hay nada que hacer. La sesión terminó.
        return NextResponse.json({ error: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }, { status: 401 });
      }

      try {
        // 3. LÓGICA DE REFRESCO: Intentamos obtener un nuevo access token.
        const refreshResponse = await djangoApi.post('/api/token/refresh/', {
          refresh: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.access;
        console.log('Nuevo access token obtenido exitosamente.');

        // 4. REINTENTO: Volvemos a hacer la petición original, pero con el nuevo token.
        const retryResponse = await djangoApi.get('/api/cursos/mis-cursos/', {
            headers: { 'Authorization': `Bearer ${newAccessToken}` }
        });
        
        // 5. RESPUESTA EXITOSA: Si el reintento funciona...
        const response = NextResponse.json(retryResponse.data);
        
        // ...adjuntamos la cookie con el NUEVO accessToken para que el navegador la actualice.
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60, // 1 hora
            path: '/',
            sameSite: 'strict',
        });

        return response;

      } catch (refreshError) {
        // 6. FALLO TOTAL: Si el refresh token también falla, la sesión ha terminado.
        console.error('Refresh token inválido. El usuario debe volver a loguearse.');
        const response = NextResponse.json({ error: 'Sesión inválida. Por favor, inicie sesión de nuevo.' }, { status: 401 });
        
        // Limpiamos las cookies del navegador.
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        
        return response;
      }
    }
    
    // Si el error original no fue un 401, fue otro tipo de error del servidor.
    console.error("Error al obtener los cursos del profesor:", error.response?.data);
    return NextResponse.json(
      { error: 'No se pudieron obtener los cursos del usuario.' },
      { status: error.response?.status || 500 }
    );
  }
}