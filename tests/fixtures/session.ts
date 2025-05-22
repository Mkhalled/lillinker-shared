import { faker } from '@faker-js/faker';
import type { Session } from '@prisma/client';

/**
 * Generate random session data for testing
 * @param overrides - Optional overrides for the generated data
 * @returns Complete Session object with all required fields
 */
export const generateSessionData = (overrides?: Partial<Session>): Session => {
  const userId = overrides?.userId ?? faker.string.uuid();
  const sessionToken = overrides?.sessionToken ?? faker.string.uuid();
  const expires = overrides?.expires ?? faker.date.future();

  // Validate required fields
  if (!userId || !sessionToken || !expires) {
    throw new Error('Session fixture requires userId, sessionToken, and expires');
  }

  // Validate expiration date
  if (expires < new Date()) {
    throw new Error('Session expiration date must be in the future');
  }

  return {
    id: faker.string.uuid(),
    userId,
    sessionToken,
    expires,
    ...overrides,
  };
};
