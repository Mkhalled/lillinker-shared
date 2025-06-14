import { Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';

import { authOptions } from '@/lib/auth';
import { CustomSession, CustomUser } from 'tests/types/auth';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

type CustomJWT = JWT & {
  role: string;
  roleId: number;
  companyId: string | null;
  sub?: string;
};

describe('NextAuth Callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('jwt callback', () => {
    it('should add user role and company information to token when user is provided', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        role: {
          name: 'CONSULTANT',
        },
        roleId: 1,
        companyId: 'test-company',
        isActive: true,
        emailVerified: new Date(),
      };

      const token = await authOptions.callbacks?.jwt?.({
        token: {} as JWT,
        user: {
          ...user,
          role: user.role.name,
          emailVerified: !!user.emailVerified,
        } as unknown as AdapterUser,
        account: null,
      });

      expect(token).toEqual({
        companyId: 'test-company',
        image: undefined,
        phone: undefined,
        pseudonym: undefined,
        role: 'CONSULTANT',
        roleId: 1,
        username: 'johndoe',
      });
    });

    it('should preserve existing token data when no user is provided', async () => {
      const existingToken: CustomJWT = {
        sub: '1',
        role: 'CONSULTANT',
        roleId: 1,
        companyId: 'test-company',
      };

      const token = await authOptions.callbacks?.jwt?.({
        token: existingToken,
        user: {} as AdapterUser,
        account: null,
      });

      expect(token).toEqual(existingToken);
    });

    it('should handle missing role information gracefully', async () => {
      const user: Partial<CustomUser> = {
        id: '1',
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        isActive: true,
        emailVerified: new Date(),
      };

      const token = await authOptions.callbacks?.jwt?.({
        token: {} as JWT,
        user: user as unknown as AdapterUser,
        account: null,
      });

      expect(token).toEqual({
        companyId: undefined,
        image: undefined,
        phone: undefined,
        pseudonym: undefined,
        role: undefined,
        roleId: undefined,
        username: 'johndoe',
      });
    });
  });

  describe('session callback', () => {
    it('should add user role to session', async () => {
      const token: CustomJWT = {
        sub: '1',
        role: 'CONSULTANT',
        roleId: 1,
        companyId: 'test-company',
      };

      const session = await authOptions.callbacks?.session?.({
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstname: 'John',
            lastname: 'Doe',
            username: 'johndoe',
            role: 'CONSULTANT',
            phone: '77686768',
            roleId: 1,
            companyId: 'test-company',
            isActive: true,
            emailVerified: true,
          },
          expires: new Date().toISOString(),
        } as Session,
        token,
        user: {} as AdapterUser,
        newSession: {},
        trigger: 'update',
      });

      expect(session).toEqual({
        user: {
          companyId: 'test-company',
          email: 'test@example.com',
          emailVerified: true,
          firstname: 'John',
          id: '1',
          image: undefined,
          isActive: true,
          lastname: 'Doe',
          phone: undefined,
          pseudonym: undefined,
          role: 'CONSULTANT',
          roleId: 1,
        },
        expires: expect.any(String),
      });
    });

    it('should handle missing token data', async () => {
      const token = {} as JWT;

      const session = await authOptions.callbacks?.session?.({
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstname: 'John',
            lastname: 'Doe',
            username: 'johndoe',
            role: 'CONSULTANT',
            roleId: 1,
            companyId: 'test-company',
            isActive: true,
            emailVerified: true,
          },
          expires: new Date().toISOString(),
        } as CustomSession,
        token,
        user: {} as AdapterUser,
        newSession: {},
        trigger: 'update',
      });

      expect(session).toEqual({
        user: {
          companyId: undefined,
          email: 'test@example.com',
          emailVerified: true,
          firstname: 'John',
          id: undefined,
          image: undefined,
          isActive: true,
          lastname: 'Doe',
          phone: undefined,
          pseudonym: undefined,
          role: undefined,
          roleId: undefined,
          username: undefined,
        },
        expires: expect.any(String),
      });
    });
  });
});
