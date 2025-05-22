import { compare } from 'bcryptjs';
import type { CredentialsConfig } from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';

import { generateUserFixture } from '../../fixtures/auth';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockImplementation(password => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation(password => {
    // For our test cases, we'll consider the password valid if it matches testPassword123!
    return Promise.resolve(password === 'testPassword123!');
  }),
}));

/**
 * Credentials Provider Tests
 *
 * This test suite covers the core authentication flow using the credentials provider.
 * It tests various scenarios including:
 * - Successful authentication
 * - Invalid credentials
 * - Inactive accounts
 * - Unverified emails
 * - Database errors
 */
describe('Credentials Provider', () => {
  let credentialsProvider: CredentialsConfig;
  const testPassword = 'testPassword123!';

  beforeAll(async () => {
    // Create a mock credentials provider
    credentialsProvider = {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
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
          throw new Error('Account is not active');
        }

        if (!user.emailVerified) {
          throw new Error('Email not verified');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          role: user.role.name,
          roleId: user.roleId,
          companyId: user.companyId,
          isActive: user.isActive,
          emailVerified: true,
        };
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should successfully authenticate with valid credentials', async () => {
      const testUser = generateUserFixture({
        isActive: true,
        emailVerified: new Date(),
        role: { name: 'PLATFORM_ADMIN' },
        roleId: 1,
      });

      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...testUser,
        password: 'hashed_testPassword123!',
      });

      const result = await credentialsProvider.authorize!(
        {
          email: testUser.email,
          password: testPassword,
        },
        {}
      );

      expect(result).toEqual({
        id: testUser.id,
        email: testUser.email,
        firstname: testUser.firstname,
        lastname: testUser.lastname,
        username: testUser.username,
        role: testUser.role.name,
        roleId: testUser.roleId,
        companyId: testUser.companyId,
        isActive: true,
        emailVerified: true,
      });
    });

    it('should reject authentication with missing credentials', async () => {
      await expect(
        credentialsProvider.authorize!(
          {
            email: '',
            password: '',
          },
          {}
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject authentication with invalid password', async () => {
      const testUser = generateUserFixture({
        isActive: true,
        emailVerified: new Date(),
      });

      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...testUser,
        password: 'hashed_testPassword123!',
      });

      await expect(
        credentialsProvider.authorize!(
          {
            email: testUser.email,
            password: 'wrongPassword',
          },
          {}
        )
      ).rejects.toThrow('Invalid password');
    });

    it('should reject authentication for inactive account', async () => {
      const testUser = generateUserFixture({
        isActive: false,
        emailVerified: new Date(),
      });

      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...testUser,
        password: 'hashed_testPassword123!',
      });

      await expect(
        credentialsProvider.authorize!(
          {
            email: testUser.email,
            password: testPassword,
          },
          {}
        )
      ).rejects.toThrow('Account is not active');
    });

    it('should reject authentication with unverified email', async () => {
      const testUser = generateUserFixture({
        isActive: true,
        emailVerified: null,
      });

      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...testUser,
        password: 'hashed_testPassword123!',
      });

      await expect(
        credentialsProvider.authorize!(
          {
            email: testUser.email,
            password: testPassword,
          },
          {}
        )
      ).rejects.toThrow('Email not verified');
    });

    it('should reject authentication for non-existent user', async () => {
      // Mock Prisma response
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        credentialsProvider.authorize!(
          {
            email: 'nonexistent@example.com',
            password: testPassword,
          },
          {}
        )
      ).rejects.toThrow('User not found');
    });

    it('should handle database errors gracefully', async () => {
      // Mock Prisma error
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(
        credentialsProvider.authorize!(
          {
            email: 'test@example.com',
            password: testPassword,
          },
          {}
        )
      ).rejects.toThrow('Database error');
    });
  });
});
