import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../../services/user.service';
import { StellarAuth } from '../../auth/stellar.auth';
import {
  StellarAuthRequest,
  EmailAuthRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from '../schemas/auth.schema';
import { JWTPayload } from '../../types/auth.types';
import { logger } from '../../utils/logger';
import { NotFoundError, DatabaseError, UnauthorizedError } from '../../types/errors.types';

/**
 * Authentication Controller
 *
 * Handles authentication-related HTTP requests
 */
export class AuthController {
  /**
   * POST /api/v1/auth/challenge
   * Generate authentication challenge for Stellar signature
   */
  async generateChallenge(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const challenge = StellarAuth.generateChallenge();

    // Challenge expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    reply.code(200).send({
      challenge,
      expiresAt: expiresAt.toISOString(),
    });
  }

  /**
   * POST /api/v1/auth/stellar
   * Authenticate with Stellar signature
   */
  async authenticateWithStellar(
    request: FastifyRequest<{ Body: StellarAuthRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { publicKey, challenge, signature } = request.body;

    logger.info('Stellar authentication attempt', {
      publicKey: StellarAuth.formatPublicKey(publicKey),
    });

    try {
      const authResponse = await userService.authenticateWithStellar(
        publicKey,
        challenge,
        signature
      );

      reply.code(200).send(authResponse);
    } catch (error) {
      // Convert database/not-found errors to unauthorized for authentication
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw new UnauthorizedError('Authentication failed');
      }
      throw error;
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate with email/password
   */
  async loginWithEmail(
    request: FastifyRequest<{ Body: EmailAuthRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email, password } = request.body;

    logger.info('Email authentication attempt', { email });

    try {
      const authResponse = await userService.authenticateWithEmail(email, password);

      reply.code(200).send(authResponse);
    } catch (error) {
      // Convert database/not-found errors to unauthorized for authentication
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw new UnauthorizedError('Authentication failed');
      }
      throw error;
    }
  }

  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  async register(
    request: FastifyRequest<{ Body: RegisterRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;

    logger.info('User registration attempt', {
      stellarKey: StellarAuth.formatPublicKey(data.stellarPublicKey),
      email: data.email,
    });

    const user = await userService.register(data);

    reply.code(201).send({
      user: {
        id: user.id,
        stellarPublicKey: user.stellarPublicKey,
        email: user.email,
        displayName: user.displayName,
        reputationScore: user.reputationScore,
      },
    });
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    const { refreshToken } = request.body;

    const result = await userService.refreshAccessToken(refreshToken);

    reply.code(200).send(result);
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user (revoke session)
   */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as any).user as JWTPayload;

    await userService.logout(user.jti);

    reply.code(200).send({
      message: 'Logged out successfully',
    });
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = ((request as any).user as JWTPayload).sub;

    const user = await userService.getUserById(userId);

    reply.code(200).send({
      id: user.id,
      stellarPublicKey: user.stellarPublicKey,
      email: user.email,
      displayName: user.displayName,
      affiliation: user.affiliation,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      reputationScore: user.reputationScore,
      orcidId: user.orcidId,
      orcidVerified: user.orcidVerified,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    });
  }
}

// Export singleton instance
export const authController = new AuthController();
