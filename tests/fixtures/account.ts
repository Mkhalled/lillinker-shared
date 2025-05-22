import { faker } from '@faker-js/faker';
import type { Account } from '@prisma/client';

/**
 * Generate random account data for testing
 * @param overrides - Optional overrides for the generated data
 * @returns Complete Account object with all required fields
 */
export const generateAccountData = (overrides?: Partial<Account>): Account => {
  const userId = overrides?.userId ?? faker.string.uuid();
  const type = overrides?.type ?? faker.helpers.arrayElement(['oauth', 'credentials']);
  const provider =
    overrides?.provider ?? faker.helpers.arrayElement(['google', 'github', 'credentials']);
  const providerAccountId = overrides?.providerAccountId ?? faker.string.uuid();

  // Validate required fields
  if (!userId || !type || !provider || !providerAccountId) {
    throw new Error('Account fixture requires userId, type, provider, and providerAccountId');
  }

  return {
    id: faker.string.uuid(),
    userId,
    type,
    provider,
    providerAccountId,
    refresh_token: null,
    access_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    session_state: null,
    ...overrides,
  };
};
