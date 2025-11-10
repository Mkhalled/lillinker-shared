import { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import type { NextAuthMiddlewareOptions } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';

import { locales } from './i18n';

// Define role types
type Role = 'ADMIN' | 'COMPANY' | 'MANAGER' | 'FREELANCE';

// Routes that require authentication and role-based access
const protectedRoutes: Record<string, Role[]> = {
  '/admin': ['ADMIN'],
  '/company/admin': ['COMPANY'],
  '/company/manager': ['MANAGER'],
  '/consultant': ['FREELANCE'],
};

// Public routes that don't require authentication or i18n
const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/error'];

// Routes that should have i18n (locale prefix) support
const i18nRoutes = ['/dev'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
});

const authOptions: NextAuthMiddlewareOptions = {
  callbacks: {
    authorized: ({ token, req }) => {
      const currentPath = req.nextUrl.pathname;

      // Allow access to localized routes (e.g., /en, /fr)
      if (currentPath.match(/^\/(en|fr)(\/.*)?$/)) {
        return true;
      }

      // If no token, user is not authenticated
      if (!token) {
        return false;
      }

      const role = token.role as Role;

      // Check if route requires specific role
      for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
        if (currentPath.startsWith(route)) {
          return allowedRoles.includes(role);
        }
      }

      // For authenticated but not role-protected routes
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip root path
  if (pathname === '/') {
    return;
  }

  // Check if it's a public route (no auth, no i18n)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return;
  }

  // Check if it's an i18n route (with or without locale prefix)
  const localePattern = new RegExp(`^/(${locales.join('|')})/`);
  const pathnameWithoutLocale = pathname.replace(localePattern, '/');
  const isI18nRoute = i18nRoutes.some(
    route => pathname.startsWith(route) || pathnameWithoutLocale.startsWith(route)
  );

  if (isI18nRoute) {
    return intlMiddleware(req);
  }

  // Check if it's a protected route (requires auth)
  const protectedPaths = Object.keys(protectedRoutes);
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    const authMiddleware = withAuth(authOptions);
    return authMiddleware(
      req as Parameters<typeof authMiddleware>[0],
      {} as Parameters<typeof authMiddleware>[1]
    );
  }

  return;
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|public).*)'],
};
