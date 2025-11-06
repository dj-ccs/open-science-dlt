import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '../../auth/jwt.service';
import { sessionRepository } from '../../database/repositories/session.repository';
import { UnauthorizedError } from '../../types/errors.types';
import { logger } from '../../utils/logger';

/**
 * Authentication Middleware
 *
 * Verifies JWT token and attaches user to request object
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = JWTService.verifyAccessToken(token);

    // Check if session is still valid
    const isValid = await sessionRepository.isValid(payload.jti);

    if (!isValid) {
      throw new UnauthorizedError('Session has been revoked or expired');
    }

    // Attach user payload to request
    request.user = payload;

    logger.debug('User authenticated', {
      userId: payload.sub,
      jti: payload.jti,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    logger.error('Authentication error', { error });
    throw new UnauthorizedError('Authentication failed');
  }
}

/**
 * Optional Authentication Middleware
 *
 * Attempts to authenticate but doesn't fail if no token provided
 * Useful for endpoints that have different behavior for authenticated users
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JWTService.verifyAccessToken(token);

      const isValid = await sessionRepository.isValid(payload.jti);
      if (isValid) {
        request.user = payload;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional authentication failed', { error });
  }
}
