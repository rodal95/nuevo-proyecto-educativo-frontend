// app/api/cursos/[id]/[campo]/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import djangoApi from '@/app/lib/djangoApiClient';

export async function GET(request, { params }) {
  const { id, campo } = await params; // No se necesita 'await' aquí

  const camposPermitidos = ['programa', 'rubrica', 'descripcion'];
  if (!camposPermitidos.includes(campo)) {
    return NextResponse.json({ error: 'Campo no válido' }, { status: 400 });
  }

  // --- CORRECCIÓN CLAVE AQUÍ ---
  // La función cookies() ahora devuelve una promesa, por lo que debe ser esperada.
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const djangoPdfUrl = `/api/cursos/mis-cursos/${id}/pdf/${campo}/`;

  try {
    const djangoResponse = await djangoApi.get(djangoPdfUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
    });

    return new NextResponse(djangoResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${campo}_curso_${id}.pdf"`,
      },
    });

  } catch (error) {
    if (error.response?.status === 401) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.json({ error: 'Sesión expirada.' }, { status: 401 });
      }

      try {
        const refreshResponse = await djangoApi.post('/api/token/refresh/', { refresh: refreshToken });
        const newAccessToken = refreshResponse.data.access;

        const retryResponse = await djangoApi.get(djangoPdfUrl, {
            headers: { 'Authorization': `Bearer ${newAccessToken}` },
            responseType: 'arraybuffer',
        });
        
        const response = new NextResponse(retryResponse.data, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${campo}_curso_${id}.pdf"`,
            },
        });

        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60,
            path: '/',
            sameSite: 'strict',
        });
        return response;

      } catch (refreshError) {
        const response = NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }
    
    return NextResponse.json(
      { error: 'No se pudo generar el PDF.' },
      { status: error.response?.status || 500 }
    );
  }
}