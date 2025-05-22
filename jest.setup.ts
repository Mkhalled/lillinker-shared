import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

import '@testing-library/jest-dom';

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock Prisma client
//mockPrisma(prisma);

// Make prisma available globally
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidCuid(): R;
    }
  }
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

global.prisma = prisma;

// Extend Jest matchers
expect.extend({
  toBeValidCuid(received) {
    const pass = /^c[^\s-]{8,}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid CUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid CUID`,
        pass: false,
      };
    }
  },
});

// Export the custom matcher type
export {};

// Mock next/router
// jest.mock('next/router', () => mockRouter);

// // Mock next-auth
// jest.mock('next-auth', () => mockNextAuth);

// // Mock Prisma
// jest.mock('@/lib/prisma', () => mockPrisma);

// Set environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL =
  'postgresql://lillinker:lillinker123@localhost:5432/lillinker_test?schema=public';

// Clean up after tests
afterAll(async () => {
  await prisma.$disconnect();
});
