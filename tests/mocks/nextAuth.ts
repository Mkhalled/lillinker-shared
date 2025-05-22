import { compare } from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export const mockNextAuth = {
  getServerSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials: any) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Email not verified');
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          roleId: user.roleId,
          companyId: user.companyId,
          emailVerified: user.emailVerified,
        };
      },
    },
  ],
};

export default mockNextAuth;
