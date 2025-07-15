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
      created_at: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    status: boolean;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    phone_number?: string;
    created_at: string;
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
  created_at: string;
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
          logger.info('NextAuth authorize started', logContext);

          if (!credentials?.email || !credentials?.password) {
            logger.warn('NextAuth authorize with missing credentials', logContext);
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            logger.warn('NextAuth authorize with non-existent email', logContext);
            return null;
          }

          logger.debug('User found for NextAuth authorize', {
            ...logContext,
            userId: user.id,
            emailVerified: user.email_verified,
            status: user.status,
            role: user.role,
          });

          // Basic checks - detailed validation is done in our custom API
          if (!user.status || !user.email_verified) {
            logger.warn('NextAuth authorize blocked - user not ready', {
              ...logContext,
              userId: user.id,
              status: user.status,
              emailVerified: user.email_verified,
            });
            return null;
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            logger.warn('NextAuth authorize with invalid password', {
              ...logContext,
              userId: user.id,
            });
            return null;
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
            created_at: user.created_at.toISOString(),
          };

          logger.info('NextAuth authorize successful', {
            ...logContext,
            userId: user.id,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
          });

          return authUser;
        } catch (error) {
          logger.error('NextAuth authorize failed', error as Error, logContext);
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
        token.last_name = authUser.last_name;
        token.first_name = authUser.first_name;
        token.phone_number = authUser.phone_number;

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
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.phone_number = token.phone_number;

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