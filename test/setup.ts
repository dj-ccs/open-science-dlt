/**
 * Global Test Setup
 *
 * Configures the test environment and provides cleanup utilities
 */

// Load test environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean database before each test
 */
export async function cleanDatabase() {
  // Delete in order to respect foreign key constraints
  await prisma.$transaction([
    prisma.reputationEvent.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.review.deleteMany(),
    prisma.paper.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

/**
 * Setup - runs before all tests
 */
beforeAll(async () => {
  // Ensure test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }
});

/**
 * Cleanup - runs before each test
 */
beforeEach(async () => {
  await cleanDatabase();
});

/**
 * Teardown - runs after all tests
 */
afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

// Export prisma instance for tests
export { prisma };
