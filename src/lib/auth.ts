import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { prisma } from './prisma';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
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
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    roleId: number;
    companyId: string | null;
  }
}

type AuthUser = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: string;
  roleId: number;
  companyId: string | null;
  isActive: boolean;
  emailVerified: boolean;
  pseudonym: string;
  image: string;
  phone: string;
  
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error("Votre compte est en cours de validation par l'administrateur");
        }

        if (!user.emailVerified) {
          throw new Error('Veuillez valider votre email');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          role: user.role.name,
          roleId: user.roleId,
          companyId: user.companyId,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          pseudonym: user.pseudonym || '',
          image: user.image || '',
          phone: user.phone || '',
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.role = authUser.role;
        token.roleId = authUser.roleId;
        token.companyId = authUser.companyId;
        token.username = authUser.username;
        token.pseudonym = authUser.pseudonym;
        token.image = authUser.image;
        token.phone = authUser.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as number;
        session.user.companyId = token.companyId as string | null;
        session.user.isActive = true; // We only get here if user is active
        session.user.emailVerified = true; // We only get here if email is verified
        session.user.username = token.username as string;
        session.user.pseudonym = token.pseudonym as string;
        session.user.image = token.image as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
};
