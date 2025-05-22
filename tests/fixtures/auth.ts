import { faker } from '@faker-js/faker';

import { CustomUser, AuthUser, CustomJWT } from '../types/auth';

/**
 * Generates a random user fixture with realistic data
 */
export function generateUserFixture(overrides: Partial<CustomUser> = {}): CustomUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    username: faker.internet.username(),
    role: {
      name: faker.helpers.arrayElement([
        'PLATFORM_ADMIN',
        'COMPANY_ADMIN',
        'COMPANY_MANAGER',
        'CONSULTANT',
      ]),
    },
    roleId: faker.number.int({ min: 1, max: 4 }),
    companyId: faker.string.uuid(),
    isActive: true,
    emailVerified: faker.date.past(),
    ...overrides,
  };
}

/**
 * Generates a random auth user fixture for session data
 */
export function generateAuthUserFixture(overrides: Partial<AuthUser> = {}): AuthUser {
  const user = generateUserFixture();
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
    emailVerified: !!user.emailVerified,
    ...overrides,
  };
}

/**
 * Generates a random JWT fixture
 */
export function generateJWTFixture(overrides: Partial<CustomJWT> = {}): CustomJWT {
  const user = generateUserFixture();
  return {
    name: `${user.firstname} ${user.lastname}`,
    email: user.email,
    picture: faker.image.avatar(),
    sub: user.id,
    role: user.role.name,
    roleId: user.roleId,
    companyId: user.companyId,
    ...overrides,
  };
}
