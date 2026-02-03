import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET, COOKIE_NAME } from '../lib/auth-constants';

/**
 * Middleware for CyberX-Hiring application
 * 
 * Handles:
 * 1. Admin page authentication (redirect to login if not authenticated)
 * 2. Admin API route protection (return 401 for unauthorized requests)
 * 3. Security headers for all responses
 * 4. Request logging for API routes
 */

// Admin API routes that require authentication
const PROTECTED_API_PATTERNS = [
  '/api/applications/stats',
  '/api/applications/export',
  '/api/auth/logout',
];

// Routes that need auth for specific methods only
const CONDITIONAL_AUTH_ROUTES = {
  '/api/applications': ['GET'],           // GET requires auth, POST is public
  '/api/applications/[id]': ['GET', 'PUT', 'PATCH', 'DELETE'], // All require auth
};

/**
 * Check if this is a protected API route
 */
function isProtectedApiRoute(pathname, method) {
  // Check exact matches
  if (PROTECTED_API_PATTERNS.some(pattern => pathname.startsWith(pattern))) {
    return true;
  }

  // Check /api/applications exactly (not sub-routes like /track)
  if (pathname === '/api/applications') {
    return method === 'GET';
  }

  // Check /api/applications/[id] pattern (matches /api/applications/abc123)
  const idRouteMatch = pathname.match(/^\/api\/applications\/([a-zA-Z0-9]+)$/);
  if (idRouteMatch && !['track', 'stats', 'export'].includes(idRouteMatch[1])) {
    return ['GET', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  return false;
}

/**
 * Verify JWT token
 */
async function verifyToken(token) {
  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

/**
 * Log API request for debugging
 */
function logApiRequest(pathname, method, status) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${pathname} - ${status}`);
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // 1. Allow public assets and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('_rsc') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Get and verify token
  const token = req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  const isAuthenticated = token ? await verifyToken(token) : false;

  // 3. Handle API routes
  if (pathname.startsWith('/api')) {
    // Check if this is a protected API route
    if (isProtectedApiRoute(pathname, method)) {
      if (!isAuthenticated) {
        logApiRequest(pathname, method, 401);
        const response = NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
        return addSecurityHeaders(response);
      }
    }

    // Allow the request, add security headers
    logApiRequest(pathname, method, 'OK');
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // 4. Handle admin dashboard routes
  const isAdminDashboard = pathname.startsWith('/hot_admin/dashboard') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin/dashboard');

  const isLoginPage = pathname === '/hot_admin' ||
    pathname === '/admin' ||
    pathname === '/admin/login';

  // Case A: Protected dashboard routes
  if (isAdminDashboard) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/hot_admin', req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access, prevent caching
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return addSecurityHeaders(response);
  }

  // Case B: Login page - redirect to dashboard if already authenticated
  if (isLoginPage) {
    if (isAuthenticated) {
      const dashboardUrl = new URL('/hot_admin/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // 5. Default: Allow other routes with security headers
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
