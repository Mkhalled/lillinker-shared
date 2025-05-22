import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function clearDatabase() {
  // Prevent accidental truncation in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'clearDatabase() can only be called in test environment. Current NODE_ENV: ' +
        process.env.NODE_ENV
    );
  }

  try {
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    if (tables && tables.length > 0) {
      for (const { tablename } of tables) {
        if (tablename !== '_prisma_migrations') {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        }
      }
    }
  } catch (error) {
    logger.error('Error clearing database', error as Error);
    throw error;
  }
}

export async function setupTestDatabase() {
  await clearDatabase();
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
}

export { prisma };
