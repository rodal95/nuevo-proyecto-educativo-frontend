// middleware.js

import { NextResponse } from 'next/server';

// 1. Define aquí las rutas que consideras públicas (accesibles sin login)
const publicPaths = ['/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // 2. Lógica para usuarios ya autenticados
  // Si el usuario tiene un token y está intentando acceder a una ruta pública (como /login),
  // lo redirigimos a la página principal del dashboard.
  if (accessToken && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Lógica para usuarios no autenticados
  // Si el usuario no tiene token y la ruta a la que intenta acceder NO es pública,
  // lo redirigimos a la página de login.
  if (!accessToken && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si no se cumple ninguna de las condiciones anteriores, permite continuar.
  return NextResponse.next();
}

// 4. Configuración del Matcher Global
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * Esto evita que el middleware se ejecute en peticiones de recursos estáticos,
     * lo cual es crucial para el rendimiento y para evitar errores.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};