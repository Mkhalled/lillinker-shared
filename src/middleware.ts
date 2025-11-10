import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import type { NextAuthMiddlewareOptions } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';

import { locales } from './i18n';

// Define role types
type Role = 'ADMIN' | 'COMPANY' | 'MANAGER' | 'FREELANCE';

// Routes that need internationalization (locale prefix: /en or /fr)
const i18nRoutes = ['/'];

// Public routes
const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/error'];

// Protected routes with role-based access control
const protectedRoutes: Record<string, Role[]> = {
  '/admin': ['ADMIN'],
  '/company/admin': ['COMPANY'],
  '/company/manager': ['MANAGER'],
  '/consultant': ['FREELANCE'],
};

// MIDDLEWARE CONFIGURATION

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
});

const authOptions: NextAuthMiddlewareOptions = {
  callbacks: {
    authorized: ({ token, req }) => {
      const currentPath = req.nextUrl.pathname;

      // Allow access to localized routes (they're public)
      const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
      if (localePattern.test(currentPath)) {
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

  // Handle Internationalization Routes
  // Check if route is already localized (starts with /en or /fr)
  const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
  const isLocalizedRoute = localePattern.test(pathname);

  if (isLocalizedRoute) {
    return intlMiddleware(req);
  }

  // Check if route needs internationalization
  const needsI18n = i18nRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  if (needsI18n) {
    return intlMiddleware(req);
  }
  // Handle Public Routes (no auth)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle Protected Routes (auth + roles)

  const protectedPaths = Object.keys(protectedRoutes);
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    const authMiddleware = withAuth(authOptions);
    return authMiddleware(
      req as Parameters<typeof authMiddleware>[0],
      {} as Parameters<typeof authMiddleware>[1]
    );
  }
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|public).*)'],
};
