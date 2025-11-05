import { Keypair } from 'stellar-sdk';
import crypto from 'crypto';
import config from 'config';
import { UnauthorizedError } from '../types/errors.types';
import { logger } from '../utils/logger';

/**
 * Stellar Authentication Service
 *
 * Handles Stellar public key signature verification and challenge generation
 */
export class StellarAuth {
  private static challengeWindow: string = config.get('auth.stellarChallengeWindow');

  /**
   * Verify Stellar signature
   *
   * @param publicKey - Stellar public key (G...)
   * @param challenge - Challenge string that was signed
   * @param signature - Base64-encoded signature
   * @returns true if signature is valid
   */
  static verifySignature(
    publicKey: string,
    challenge: string,
    signature: string
  ): boolean {
    try {
      // Validate public key format
      if (!publicKey.startsWith('G') || publicKey.length !== 56) {
        throw new UnauthorizedError('Invalid Stellar public key format');
      }

      // Create keypair from public key
      const keypair = Keypair.fromPublicKey(publicKey);

      // Convert challenge and signature to buffers
      const challengeBuffer = Buffer.from(challenge, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'base64');

      // Verify signature
      const isValid = keypair.verify(challengeBuffer, signatureBuffer);

      if (!isValid) {
        logger.warn('Invalid Stellar signature', { publicKey });
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying Stellar signature', { error, publicKey });
      throw new UnauthorizedError('Invalid Stellar signature');
    }
  }

  /**
   * Generate authentication challenge
   *
   * Format: "open-science-dlt-auth:{timestamp}:{random}"
   * This format prevents replay attacks and ensures freshness
   */
  static generateChallenge(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return `open-science-dlt-auth:${timestamp}:${random}`;
  }

  /**
   * Validate challenge freshness
   *
   * Checks that the challenge was generated within the allowed time window
   * Default: 5 minutes
   */
  static isChallengeValid(challenge: string): boolean {
    try {
      const parts = challenge.split(':');

      // Validate format
      if (parts.length !== 3 || parts[0] !== 'open-science-dlt-auth') {
        logger.warn('Invalid challenge format', { challenge });
        return false;
      }

      // Parse timestamp
      const timestamp = parseInt(parts[1]);
      if (isNaN(timestamp)) {
        logger.warn('Invalid challenge timestamp', { challenge });
        return false;
      }

      // Check if challenge is within time window
      const now = Date.now();
      const windowMs = this.parseTimeWindow(this.challengeWindow);

      if (now - timestamp > windowMs) {
        logger.warn('Challenge expired', { challenge, age: now - timestamp });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating challenge', { error, challenge });
      return false;
    }
  }

  /**
   * Parse time window string (e.g., "5m" -> 300000ms)
   */
  private static parseTimeWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 5 * 60 * 1000; // Default 5 minutes
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const milliseconds: { [key: string]: number } = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * milliseconds[unit];
  }

  /**
   * Validate public key format
   */
  static isValidPublicKey(publicKey: string): boolean {
    try {
      return (
        publicKey.startsWith('G') &&
        publicKey.length === 56 &&
        /^G[A-Z2-7]{55}$/.test(publicKey)
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract user-friendly info from public key (first 4 and last 4 chars)
   */
  static formatPublicKey(publicKey: string): string {
    if (publicKey.length !== 56) {
      return publicKey;
    }
    return `${publicKey.substring(0, 4)}...${publicKey.substring(52)}`;
  }
}
