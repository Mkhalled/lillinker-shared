import { prisma } from '@/lib/prisma';

/**
 * Creates a unique identifier by combining a base name with a timestamp and random string
 * @param baseName - The base name to make unique
 * @returns A unique identifier
 */
export function createUniqueIdentifier(baseName: string): string {
  return `${baseName}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Sets up a complete test environment with all necessary entities
 * @returns Object containing created entities
 */
export async function setupTestEnvironment() {
  const role = await prisma.role.create({
    data: {
      name: createUniqueIdentifier('TEST_ROLE'),
      displayName: 'Test Role',
      description: 'Test role description',
      isSystem: false,
    },
  });

  const company = await prisma.company.create({
    data: {
      name: createUniqueIdentifier('TEST_COMPANY'),
      siret: '12345678901234',
      type: 'SARL',
      address: '123 Test Street',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country',
      phone: '+1234567890',
      email: 'test@company.com',
      dateFondation: new Date(),
      capital: 100000,
      managementCosts: 0,
      numberPorted: 0,
      isActive: true,
    },
  });

  return { role, company };
}

/**
 * Cleans up test data after each test
 */
export async function cleanupTestData(): Promise<void> {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.company.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
  ]);
}
