import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Custom user type that extends the base user type with our application-specific fields
 */
export interface CustomUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: {
    name: string;
  };
  roleId: number;
  companyId: string | null;
  isActive: boolean;
  emailVerified: Date | null;
}

/**
 * Auth user type that represents the user data in the session
 */
export interface AuthUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  pseudonym: string;
  image: string;
  phone: string;
  role: string;
  roleId: number;
  companyId: string | null;
  isActive: boolean;
  emailVerified: boolean;
}

/**
 * Custom JWT type that extends the base JWT with our application-specific fields
 */
export type CustomJWT = JWT & {
  role: string;
  roleId: number;
  companyId: string | null;
  sub?: string;
};

/**
 * Custom session type that extends the base session with our application-specific user type
 */
export interface CustomSession extends Session {
  user: AuthUser;
}
