import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of Prisma Client exists throughout the application.
 * In development, prevents hot-reload from creating multiple instances.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

/**
 * Graceful shutdown handler
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectDatabase();
});
