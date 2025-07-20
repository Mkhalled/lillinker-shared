import { withAuth } from 'next-auth/middleware';
import type { NextAuthMiddlewareOptions } from 'next-auth/middleware';

// Define role types
type Role = 'ADMIN' | 'COMPANY' | 'MANAGER' | 'FREELANCE';

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, Role[]> = {
  '/admin': ['ADMIN'],
  '/company/admin': ['COMPANY'],
  '/company/manager': ['MANAGER'],
  '/consultant': ['FREELANCE'],
};

const authOptions: NextAuthMiddlewareOptions = {
  callbacks: {
    authorized: ({ token, req }) => {
      // If no token, user is not authenticated
      if (!token) {
        return false;
      }

      const role = token.role as Role;
      const currentPath = req.nextUrl.pathname;

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

export default withAuth(authOptions);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images
     * - public folder
     * - auth routes
     * - public API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public|auth|api/auth|api/platform-services|$|api/metiers|api/check-email).*)',
  ],
};
