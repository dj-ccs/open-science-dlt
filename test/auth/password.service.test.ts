/**
 * Password Service Tests
 */

import { PasswordService } from '../../src/auth/password.service';
import { cleanDatabase } from '../setup';

describe('PasswordService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // Bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await PasswordService.hash(password);
      const hash2 = await PasswordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
    });
  });

  describe('compare', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      const isValid = await PasswordService.compare(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      const isValid = await PasswordService.compare('WrongPassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with slight variation', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      const isValid = await PasswordService.compare('SecurePassword123', hash); // Missing !

      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      const isValid = await PasswordService.compare('securepassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const isValid = await PasswordService.compare('password', 'invalid-hash');

      expect(isValid).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('should accept a strong password', () => {
      const result = PasswordService.validateStrength('SecurePassword123!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordService.validateStrength('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = PasswordService.validateStrength('password123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = PasswordService.validateStrength('PASSWORD123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = PasswordService.validateStrength('SecurePassword!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = PasswordService.validateStrength('SecurePassword123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for weak password', () => {
      const result = PasswordService.validateStrength('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept password with various special characters', () => {
      const passwords = [
        'Password123!',
        'Password123@',
        'Password123#',
        'Password123$',
        'Password123%',
      ];

      passwords.forEach(password => {
        const result = PasswordService.validateStrength(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('needsRehash', () => {
    it('should return false for hash with correct salt rounds', async () => {
      const password = 'SecurePassword123!';
      const hash = await PasswordService.hash(password);

      const needsRehash = PasswordService.needsRehash(hash);

      expect(needsRehash).toBe(false);
    });

    it('should return true for invalid hash', () => {
      const needsRehash = PasswordService.needsRehash('invalid-hash');

      expect(needsRehash).toBe(true);
    });
  });
});
