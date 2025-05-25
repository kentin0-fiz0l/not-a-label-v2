import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { securityMiddleware, ddosProtection } from './middleware/security';
import { cacheMiddleware } from './middleware/cache';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/upload',
  '/settings',
  '/analytics',
  '/api/user',
  '/api/upload',
  '/api/tracks/create',
  '/api/distribution',
];

// Routes that require admin access
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  
  // Apply DDoS protection first
  const ddosResponse = await ddosProtection(request);
  if (ddosResponse.status !== 200) {
    return ddosResponse;
  }
  
  // Apply security middleware
  const securityResponse = await securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }
  
  // Authentication check
  const token = await getToken({ req: request });
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  if (isAdminRoute) {
    if (!token || token.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // Apply caching for GET requests
  if (request.method === 'GET') {
    return cacheMiddleware(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};