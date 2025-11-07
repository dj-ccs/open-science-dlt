import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

/**
 * Password Service
 *
 * Handles password hashing and verification using bcrypt
 */
export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password
   *
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hash(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      logger.debug('Password hashed successfully');
      return hash;
    } catch (error) {
      logger.error('Error hashing password', { error });
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   *
   * @param password - Plain text password
   * @param hash - Hashed password from database
   * @returns true if password matches
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Error comparing password', { error });
      return false;
    }
  }

  /**
   * Validate password strength
   *
   * Requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a hash needs rehashing (e.g., salt rounds increased)
   */
  static needsRehash(hash: string): boolean {
    try {
      return bcrypt.getRounds(hash) < this.SALT_ROUNDS;
    } catch {
      return true;
    }
  }
}
