/**
 * Stellar Authentication Service Tests
 */

import { StellarAuth } from '../../src/auth/stellar.auth';
import { UnauthorizedError } from '../../src/types/errors.types';
import { generateStellarKeypair, signChallenge } from '../helpers/factories';

describe('StellarAuth', () => {
  describe('verifySignature', () => {
    it('should verify a valid signature', () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge = 'test-challenge-message';
      const signature = signChallenge(challenge, keypair);

      const isValid = StellarAuth.verifySignature(publicKey, challenge, signature);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const { publicKey } = generateStellarKeypair();
      const challenge = 'test-challenge-message';
      const invalidSignature = 'aW52YWxpZC1zaWduYXR1cmU='; // Base64 'invalid-signature'

      expect(() => {
        StellarAuth.verifySignature(publicKey, challenge, invalidSignature);
      }).toThrow(UnauthorizedError);
    });

    it('should reject signature with wrong challenge', () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge1 = 'challenge-one';
      const challenge2 = 'challenge-two';
      const signature = signChallenge(challenge1, keypair);

      expect(() => {
        StellarAuth.verifySignature(publicKey, challenge2, signature);
      }).toThrow(UnauthorizedError);
    });

    it('should reject signature from different keypair', () => {
      const { publicKey: publicKey1 } = generateStellarKeypair();
      const { keypair: keypair2 } = generateStellarKeypair();
      const challenge = 'test-challenge';
      const signature = signChallenge(challenge, keypair2);

      expect(() => {
        StellarAuth.verifySignature(publicKey1, challenge, signature);
      }).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid public key format', () => {
      const challenge = 'test-challenge';
      const signature = 'c2lnbmF0dXJl'; // Base64 'signature'

      expect(() => {
        StellarAuth.verifySignature('INVALID_KEY', challenge, signature);
      }).toThrow(UnauthorizedError);
    });
  });

  describe('generateChallenge', () => {
    it('should generate a valid challenge', () => {
      const challenge = StellarAuth.generateChallenge();

      expect(challenge).toBeDefined();
      expect(typeof challenge).toBe('string');
      expect(challenge).toMatch(/^open-science-dlt-auth:\d+:[a-f0-9]{32}$/);
    });

    it('should generate unique challenges', () => {
      const challenge1 = StellarAuth.generateChallenge();
      const challenge2 = StellarAuth.generateChallenge();

      expect(challenge1).not.toBe(challenge2);
    });

    it('should include timestamp in challenge', () => {
      const challenge = StellarAuth.generateChallenge();
      const parts = challenge.split(':');
      const timestamp = parseInt(parts[1]);

      expect(timestamp).toBeGreaterThan(Date.now() - 1000);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('isChallengeValid', () => {
    it('should validate a fresh challenge', () => {
      const challenge = StellarAuth.generateChallenge();
      const isValid = StellarAuth.isChallengeValid(challenge);

      expect(isValid).toBe(true);
    });

    it('should reject an expired challenge', () => {
      // Create challenge with old timestamp (6 minutes ago)
      const oldTimestamp = Date.now() - (6 * 60 * 1000);
      const challenge = `open-science-dlt-auth:${oldTimestamp}:abcdef1234567890`;

      const isValid = StellarAuth.isChallengeValid(challenge);

      expect(isValid).toBe(false);
    });

    it('should reject challenge with invalid format', () => {
      const invalidChallenges = [
        'invalid-challenge',
        'wrong-prefix:123456:random',
        'open-science-dlt-auth:notanumber:random',
        'open-science-dlt-auth:123456', // Missing part
      ];

      invalidChallenges.forEach(challenge => {
        const isValid = StellarAuth.isChallengeValid(challenge);
        expect(isValid).toBe(false);
      });
    });

    it('should accept challenge within 5 minute window', () => {
      // Create challenge 4 minutes ago
      const recentTimestamp = Date.now() - (4 * 60 * 1000);
      const challenge = `open-science-dlt-auth:${recentTimestamp}:abcdef1234567890`;

      const isValid = StellarAuth.isChallengeValid(challenge);

      expect(isValid).toBe(true);
    });
  });

  describe('isValidPublicKey', () => {
    it('should validate a correct Stellar public key', () => {
      const { publicKey } = generateStellarKeypair();
      const isValid = StellarAuth.isValidPublicKey(publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject keys with wrong prefix', () => {
      const invalidKey = 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      const isValid = StellarAuth.isValidPublicKey(invalidKey);

      expect(isValid).toBe(false);
    });

    it('should reject keys with wrong length', () => {
      const shortKey = 'GXXX';
      const longKey = 'G' + 'X'.repeat(60);

      expect(StellarAuth.isValidPublicKey(shortKey)).toBe(false);
      expect(StellarAuth.isValidPublicKey(longKey)).toBe(false);
    });

    it('should reject keys with invalid characters', () => {
      const invalidKey = 'G' + '!'.repeat(55);
      const isValid = StellarAuth.isValidPublicKey(invalidKey);

      expect(isValid).toBe(false);
    });
  });

  describe('formatPublicKey', () => {
    it('should format a public key for display', () => {
      const publicKey = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      const formatted = StellarAuth.formatPublicKey(publicKey);

      expect(formatted).toBe('GXXX...XXXX');
    });

    it('should return original key if length is wrong', () => {
      const shortKey = 'GXXX';
      const formatted = StellarAuth.formatPublicKey(shortKey);

      expect(formatted).toBe(shortKey);
    });
  });
});
