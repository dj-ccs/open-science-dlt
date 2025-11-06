/**
 * Test Data Factories
 *
 * Provides factory functions for creating test data
 */

import { Keypair } from 'stellar-sdk';
import { prisma } from '../setup';
import { PasswordService } from '../../src/auth/password.service';

/**
 * Generate a test Stellar keypair
 */
export function generateStellarKeypair() {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    keypair,
  };
}

/**
 * Create a test user
 */
export async function createTestUser(overrides?: {
  stellarPublicKey?: string;
  email?: string;
  password?: string;
  displayName?: string;
  affiliation?: string;
  reputationScore?: number;
}) {
  const stellarKeys = generateStellarKeypair();

  const userData: any = {
    stellarPublicKey: overrides?.stellarPublicKey || stellarKeys.publicKey,
    displayName: overrides?.displayName || 'Test User',
    affiliation: overrides?.affiliation || 'Test University',
    reputationScore: overrides?.reputationScore || 0,
  };

  if (overrides?.email) {
    userData.email = overrides.email;
  }

  if (overrides?.password) {
    userData.passwordHash = await PasswordService.hash(overrides.password);
  }

  const user = await prisma.user.create({
    data: userData,
  });

  return {
    user,
    stellarKeys: overrides?.stellarPublicKey ? null : stellarKeys,
  };
}

/**
 * Create a test session
 */
export async function createTestSession(userId: string, jti: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return await prisma.session.create({
    data: {
      userId,
      jti,
      expiresAt,
      refreshToken: `refresh_${jti}`,
    },
  });
}

/**
 * Create a test paper
 */
export async function createTestPaper(
  submitterId: string,
  overrides?: {
    title?: string;
    abstract?: string;
    keywords?: string[];
    ipfsHash?: string;
    stellarTxHash?: string;
  }
) {
  return await prisma.paper.create({
    data: {
      submitterId,
      ipfsHash: overrides?.ipfsHash || `Qm${Math.random().toString(36).substring(2, 15)}`,
      stellarTxHash:
        overrides?.stellarTxHash || `tx_${Math.random().toString(36).substring(2, 15)}`,
      title: overrides?.title || 'Test Paper',
      abstract:
        overrides?.abstract ||
        'This is a test paper abstract with sufficient length for validation.',
      keywords: overrides?.keywords || ['test', 'paper', 'keywords'],
      authorKeys: [],
      authorOrcids: [],
    },
  });
}

/**
 * Sign a challenge with a Stellar keypair
 */
export function signChallenge(challenge: string, keypair: any): string {
  const challengeBuffer = Buffer.from(challenge, 'utf-8');
  const signature = keypair.sign(challengeBuffer);
  return signature.toString('base64');
}
