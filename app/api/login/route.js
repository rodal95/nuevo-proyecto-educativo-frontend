// frontend/app/api/login/route.js

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import djangoApi from '@/app/lib/djangoApiClient';

export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  try {
    // Llama a la API de Django para obtener los tokens de autenticación
    const djangoResponse = await djangoApi.post('/api/token/', {
      username,
      password,
    });

    const { access, refresh } = djangoResponse.data;

    // Crea la cookie para el accessToken
    const accessTokenCookie = serialize('accessToken', access, {
      httpOnly: true,
      secure: false, // <-- CAMBIO APLICADO: Forzado a false para funcionar sobre HTTP
      maxAge: 60 * 30, // 30 minutos
      path: '/',
      sameSite: 'strict',
    });

    // Crea la cookie para el refreshToken
    const refreshTokenCookie = serialize('refreshToken', refresh, {
      httpOnly: true,
      secure: false, // <-- CAMBIO APLICADO: Forzado a false para funcionar sobre HTTP
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
      sameSite: 'strict',
    });

    // Crea una respuesta JSON exitosa
    const response = NextResponse.json({ message: 'Login exitoso' });

    // Añade las dos cookies a la cabecera de la respuesta
    // (Se usa 'append' para poder establecer múltiples cookies)
    response.headers.append('Set-Cookie', accessTokenCookie);
    response.headers.append('Set-Cookie', refreshTokenCookie);

    return response;

  } catch (error) {
    // Manejo de errores en caso de que las credenciales sean inválidas
    console.error("Error en la llamada a Django (login):", error.response?.data);
    
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Credenciales inválidas' },
      { status: error.response?.status || 500 }
    );
  }
}