import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";
import { withAuth } from 'next-auth/middleware';
import type { NextAuthMiddlewareOptions } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

// Define role types
type Role = 'ADMIN' | 'COMPANY' | 'MANAGER' | 'FREELANCE';

const protectedRoutes: Record<string, Role[]> = {
  '/admin': ['ADMIN'],
  '/company/admin': ['COMPANY'],
  '/company/manager': ['MANAGER'],
  '/consultant': ['FREELANCE'],
};

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en", 
  localeDetection: true 
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
  
  if (pathname === '/') {
    return;
  }
  const protectedPaths = ['/admin', '/company', '/consultant', '/auth'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedRoute) {
    return (withAuth(authOptions) as any)(req);
  }
  
  return intlMiddleware(req);
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|images|public).*)",],
};
