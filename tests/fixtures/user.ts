import { faker } from '@faker-js/faker';
import type { User } from '@prisma/client';

import { RoleEnum } from '@/constants/Role.enum';

interface BaseUserData {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  phone: string | null;
  roleId: number;
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: Date | null;
  pseudonym: string | null;
  pseudonymGeneratedAt: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate base user data that can be used by both User and UserFixture
 * @param overrides - Optional overrides for the generated data
 * @returns Base user data object
 */
const generateBaseUserData = (overrides: Partial<BaseUserData> = {}): BaseUserData => {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const username = faker.internet.username({ firstName: firstname, lastName: lastname });
  const email = faker.internet.email({ firstName: firstname, lastName: lastname });
  const password = faker.internet.password({ length: 12 });
  const phone = faker.phone.number();
  const roleId = overrides?.roleId ?? 1;
  const isActive = overrides?.isActive ?? false;
  const emailVerified = overrides?.emailVerified ?? false;
  const emailVerificationToken = overrides?.emailVerificationToken ?? faker.string.uuid();
  const emailVerificationTokenExpiresAt =
    overrides?.emailVerificationTokenExpiresAt ?? faker.date.future();
  const pseudonym = overrides?.pseudonym ?? null;
  const pseudonymGeneratedAt = overrides?.pseudonymGeneratedAt ?? null;
  const image = overrides?.image ?? null;
  const createdAt = overrides?.createdAt ?? faker.date.past();
  const updatedAt = overrides?.updatedAt ?? faker.date.recent();

  // Validate required fields
  if (!email || !username || !password || !roleId) {
    throw new Error('User fixture requires email, username, password, and roleId');
  }

  // Validate email format
  if (!email.includes('@')) {
    throw new Error('Invalid email format in user fixture');
  }

  // Validate username format
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Validate roleId
  if (roleId < 1) {
    throw new Error('roleId must be a positive number');
  }

  return {
    firstname,
    lastname,
    email,
    username,
    password,
    phone,
    roleId,
    isActive,
    emailVerified,
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
    pseudonym,
    pseudonymGeneratedAt,
    image,
    createdAt,
    updatedAt,
    ...overrides,
  };
};

/**
 * Generate random user data for testing
 * @param overrides - Optional overrides for the generated data
 * @returns Complete User object with all required fields
 */
export const generateUserData = (overrides?: Partial<User>): User => {
  const baseData = generateBaseUserData(overrides);
  return {
    id: faker.string.uuid(),
    companyId: overrides?.companyId ?? null,
    ...baseData,
  };
};

export type UserRegistrationData = {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  role: RoleEnum;
};

export function generateUserRegistrationData(
  overrides: Partial<UserRegistrationData> = {}
): UserRegistrationData {
  return {
    firstname: overrides.firstname ?? faker.person.firstName(),
    lastname: overrides.lastname ?? faker.person.lastName(),
    email: overrides.email ?? faker.internet.email(),
    username: overrides.username ?? faker.internet.username(),
    password: overrides.password ?? faker.internet.password(),
    phone: overrides.phone ?? faker.phone.number(),
    role: overrides.role ?? RoleEnum.CONSULTANT,
  };
}
