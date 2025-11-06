import { User } from '@prisma/client';
import { userRepository } from '../database/repositories/user.repository';
import { sessionRepository } from '../database/repositories/session.repository';
import { JWTService } from '../auth/jwt.service';
import { PasswordService } from '../auth/password.service';
import { StellarAuth } from '../auth/stellar.auth';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../types/errors.types';
import { AuthResponse } from '../types/auth.types';
import { logger } from '../utils/logger';

/**
 * User Service
 *
 * Business logic for user management and authentication
 */
export class UserService {
  /**
   * Authenticate user with Stellar signature
   */
  async authenticateWithStellar(
    publicKey: string,
    challenge: string,
    signature: string
  ): Promise<AuthResponse> {
    // Validate challenge freshness
    if (!StellarAuth.isChallengeValid(challenge)) {
      throw new UnauthorizedError('Challenge expired or invalid');
    }

    // Verify signature
    const isValid = StellarAuth.verifySignature(publicKey, challenge, signature);
    if (!isValid) {
      throw new UnauthorizedError('Invalid signature');
    }

    // Find or create user
    let user = await userRepository.findByStellarKey(publicKey);

    if (!user) {
      // Auto-register user on first authentication
      user = await userRepository.create({
        stellarPublicKey: publicKey,
      });
      logger.info('New user auto-registered via Stellar auth', { userId: user.id });
    }

    // Check if user is active
    if (!user.isActive || user.isBanned) {
      throw new UnauthorizedError('User account is inactive or banned');
    }

    // Generate tokens
    return await this.generateAuthTokens(user);
  }

  /**
   * Authenticate user with email/password
   */
  async authenticateWithEmail(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user has password set
    if (!user.passwordHash) {
      throw new UnauthorizedError('Password authentication not configured for this account');
    }

    // Verify password
    const isValid = await PasswordService.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive || user.isBanned) {
      throw new UnauthorizedError('User account is inactive or banned');
    }

    // Generate tokens
    return await this.generateAuthTokens(user);
  }

  /**
   * Register new user
   */
  async register(data: {
    stellarPublicKey: string;
    email?: string;
    password?: string;
    displayName?: string;
    affiliation?: string;
    bio?: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await userRepository.findByStellarKey(data.stellarPublicKey);
    if (existingUser) {
      throw new ConflictError('User with this Stellar public key already exists');
    }

    if (data.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Validate password if provided
    let passwordHash: string | undefined;
    if (data.password) {
      const validation = PasswordService.validateStrength(data.password);
      if (!validation.isValid) {
        throw new ValidationError('Password does not meet requirements', validation.errors);
      }
      passwordHash = await PasswordService.hash(data.password);
    }

    // Create user
    const user = await userRepository.create({
      stellarPublicKey: data.stellarPublicKey,
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      affiliation: data.affiliation,
      bio: data.bio,
    });

    logger.info('New user registered', { userId: user.id });

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    // Verify refresh token
    const payload = JWTService.verifyRefreshToken(refreshToken);

    // Find session by refresh token
    const session = await sessionRepository.findByRefreshToken(refreshToken);
    if (!session || session.isRevoked) {
      throw new UnauthorizedError('Invalid or revoked refresh token');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive || user.isBanned) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new access token
    const { token, jti, expiresAt } = JWTService.generateAccessToken({
      sub: user.id,
      stellarKey: user.stellarPublicKey,
      email: user.email || undefined,
      orcidId: user.orcidId || undefined,
      reputation: user.reputationScore,
    });

    // Update session with new JTI
    await sessionRepository.create({
      userId: user.id,
      jti,
      expiresAt,
      refreshToken: session.refreshToken,
    });

    return {
      accessToken: token,
      expiresIn: JWTService.getExpirationSeconds(),
    };
  }

  /**
   * Logout user (revoke session)
   */
  async logout(jti: string): Promise<void> {
    await sessionRepository.revoke(jti, 'User logout');
    logger.info('User logged out', { jti });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      affiliation?: string;
      bio?: string;
      avatarUrl?: string;
    }
  ): Promise<User> {
    return await userRepository.update(userId, data);
  }

  /**
   * Generate auth tokens and create session
   */
  private async generateAuthTokens(user: User): Promise<AuthResponse> {
    // Generate JWT tokens
    const { token: accessToken, jti, expiresAt } = JWTService.generateAccessToken({
      sub: user.id,
      stellarKey: user.stellarPublicKey,
      email: user.email || undefined,
      orcidId: user.orcidId || undefined,
      reputation: user.reputationScore,
    });

    const refreshToken = JWTService.generateRefreshToken(user.id);

    // Create session
    await sessionRepository.create({
      user: {
        connect: { id: user.id },
      },
      jti,
      expiresAt,
      refreshToken,
    });

    logger.info('Auth tokens generated', { userId: user.id, jti });

    return {
      accessToken,
      refreshToken,
      expiresIn: JWTService.getExpirationSeconds(),
      user: {
        id: user.id,
        stellarPublicKey: user.stellarPublicKey,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        reputationScore: user.reputationScore,
        orcidId: user.orcidId || undefined,
      },
    };
  }
}

// Export singleton instance
export const userService = new UserService();
