/**
 * User Model Tests
 *
 * Comprehensive test suite for the User model covering:
 * - ID generation
 * - Role relationships
 * - Company relationships
 * - Field validation
 * - User status management
 *
 * For detailed documentation of test coverage and assumptions,
 * see: tests/README.md
 */

import { hash } from 'bcryptjs';

import { prisma } from '@/lib/prisma';

import { generateUserData } from '../../fixtures/user';
import { cleanupTestData, setupTestEnvironment } from '../../helpers/test-utils';

describe('User Model', () => {
  let roleId: number;
  let companyId: string | null;

  beforeEach(async () => {
    await cleanupTestData();
    const { role, company } = await setupTestEnvironment();
    roleId = role.id;
    companyId = company.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const userData = generateUserData({
        roleId,
        companyId,
        password: await hash('password123', 10),
      });

      const user = await prisma.user.create({
        data: userData,
        include: {
          role: true,
          company: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.roleId).toBe(roleId);
      expect(user.companyId).toBe(companyId);
    });

    it('should enforce unique email constraint', async () => {
      const userData = generateUserData({
        roleId,
        companyId,
        password: await hash('password123', 10),
      });

      // Create first user
      await prisma.user.create({
        data: userData,
      });

      // Attempt to create second user with same email
      await expect(
        prisma.user.create({
          data: userData,
        })
      ).rejects.toThrow();
    });

    it('should enforce unique username constraint', async () => {
      const userData = generateUserData({
        roleId,
        companyId,
        password: await hash('password123', 10),
      });

      // Create first user
      await prisma.user.create({
        data: userData,
      });

      // Attempt to create second user with same username
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            email: 'different@example.com', // Different email but same username
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('find', () => {
    it('should find user by email', async () => {
      const userData = generateUserData({
        roleId,
        companyId,
        password: await hash('password123', 10),
      });

      const createdUser = await prisma.user.create({
        data: userData,
      });

      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should find user by username', async () => {
      const userData = generateUserData({
        roleId,
        companyId,
        password: await hash('password123', 10),
      });

      const createdUser = await prisma.user.create({
        data: userData,
      });

      const foundUser = await prisma.user.findUnique({
        where: { username: userData.username },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });
  });
});
