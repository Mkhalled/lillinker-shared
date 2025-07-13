import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { logger } from './logger';
import { prisma } from './prisma';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      phone_number?: string;
      status: boolean;
      email_verified: boolean;
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    status: boolean;
    email_verified: boolean;
  }
}

type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  status: boolean;
  email_verified: boolean;
  image?: string;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const logContext = {
          operation: 'authorize',
          email: credentials?.email,
        };

        try {
          logger.info('Login attempt started', logContext);

          if (!credentials?.email || !credentials?.password) {
            logger.warn('Login attempt with missing credentials', logContext);
            throw new Error('Invalid credentials');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            logger.warn('Login attempt with non-existent email', logContext);
            throw new Error('User not found');
          }

          logger.debug('User found for login attempt', {
            ...logContext,
            userId: user.id,
            emailVerified: user.email_verified,
            status: user.status,
            role: user.role,
          });

          if (!user.status) {
            logger.warn('Login blocked - account not validated by administrator', {
              ...logContext,
              userId: user.id,
              reason: 'account_not_validated',
            });
            throw new Error("Your account is being validated by the administrator");
          }

          if (!user.email_verified) {
            logger.warn('Login blocked - email not verified', {
              ...logContext,
              userId: user.id,
              reason: 'email_not_verified',
            });
            throw new Error('Please verify your email address');
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            logger.warn('Login attempt with invalid password', {
              ...logContext,
              userId: user.id,
              reason: 'invalid_password',
            });
            throw new Error('Invalid password');
          }

          const authUser: AuthUser = {
            id: user.id.toString(),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            phone_number: user.phone_number || undefined,
            status: user.status,
            email_verified: user.email_verified,
            image: user.image || undefined,
          };

          logger.info('Login successful', {
            ...logContext,
            userId: user.id,
            role: user.role,
            firstName: user.first_name,
          });

          return authUser;
        } catch (error) {
          logger.error('Login failed', error as Error, logContext);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.role = authUser.role;
        token.status = authUser.status;
        token.email_verified = authUser.email_verified;

        logger.debug('JWT token created', {
          operation: 'jwt_callback',
          userId: authUser.id,
          email: authUser.email,
          role: authUser.role,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.status = token.status as boolean;
        session.user.email_verified = token.email_verified as boolean;

        logger.debug('Session created', {
          operation: 'session_callback',
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
        });
      }
      return session;
    },
  },
};