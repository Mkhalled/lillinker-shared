import { faker } from '@faker-js/faker';
import { Prisma, Role } from '@prisma/client';

/**
 * Generates test data for a role
 * @param overrides - Optional overrides for the generated data
 * @returns Role creation data
 */
export const generateRoleData = (
  overrides: Partial<Prisma.RoleCreateInput> = {}
): Prisma.RoleCreateInput => ({
  name: faker.person.jobTitle(),
  displayName: faker.person.jobTitle(),
  description: faker.lorem.sentence(),
  isSystem: false,
  ...overrides,
});

/**
 * Generates a mock role for Prisma
 * @param overrides - Optional overrides for the generated data
 * @returns Mock role data
 */
export const generateMockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 1,
  name: 'CONSULTANT',
  displayName: 'Consultant',
  description: 'Consultant role',
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
