import jwt from 'jsonwebtoken';
import config from 'config';
import crypto from 'crypto';
import { JWTPayload } from '../types/auth.types';
import { UnauthorizedError } from '../types/errors.types';
import { logger } from '../utils/logger';

/**
 * JWT Service
 *
 * Handles JWT token generation, verification, and refresh
 */
export class JWTService {
  private static jwtSecret: string = config.get('auth.jwtSecret');
  private static jwtExpiration: string = config.get('auth.jwtExpiration');
  private static refreshTokenSecret: string = config.get('auth.refreshTokenSecret');
  private static refreshTokenExpiration: string = config.get('auth.refreshTokenExpiration');

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): {
    token: string;
    jti: string;
    expiresAt: Date;
  } {
    const jti = crypto.randomUUID();

    const token = (jwt.sign as any)(
      { ...payload, jti },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiration,
        issuer: 'open-science-dlt',
        audience: 'open-science-dlt-api',
      }
    ) as string;

    // Calculate expiration date
    const decoded = jwt.decode(token) as JWTPayload;
    const expiresAt = new Date(decoded.exp * 1000);

    logger.debug('Access token generated', { userId: payload.sub, jti });

    return { token, jti, expiresAt };
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const token = (jwt.sign as any)(
      { sub: userId, type: 'refresh' },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiration,
        issuer: 'open-science-dlt',
      }
    ) as string;

    logger.debug('Refresh token generated', { userId });

    return token;
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        issuer: 'open-science-dlt',
        audience: 'open-science-dlt-api',
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { sub: string; type: string } {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'open-science-dlt',
      }) as { sub: string; type: string };

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw new UnauthorizedError('Refresh token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): JWTPayload | null {
    return jwt.decode(token) as JWTPayload | null;
  }

  /**
   * Get token expiration time in seconds
   */
  static getExpirationSeconds(): number {
    const exp = this.jwtExpiration;

    // Parse expiration string (e.g., "1h", "30m", "7d")
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const seconds: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * seconds[unit];
  }
}
