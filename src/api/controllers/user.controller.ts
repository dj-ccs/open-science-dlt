import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../../services/user.service';
import { UpdateUserProfile, UserIdParam } from '../schemas/user.schema';
import { JWTPayload } from '../../types/auth.types';
import { logger } from '../../utils/logger';
import { ForbiddenError } from '../../types/errors.types';

/**
 * User Controller
 *
 * Handles HTTP requests for user profile and reputation endpoints
 */
export class UserController {
  /**
   * GET /api/v1/users/:id
   * Fetch public user profile
   *
   * @public
   */
  async getUserProfile(
    request: FastifyRequest<{ Params: UserIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    logger.info({ userId: id }, 'Fetching user profile');

    const user = await userService.getUserById(id);

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
      updatedAt: user.updatedAt.toISOString(),
    });
  }

  /**
   * PATCH /api/v1/users/:id
   * Update user profile (authenticated, own profile only)
   *
   * @authenticated
   * @throws {ForbiddenError} If user tries to update another user's profile
   */
  async updateUserProfile(
    request: FastifyRequest<{
      Params: UserIdParam;
      Body: UpdateUserProfile;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const updates = request.body;
    const currentUser = (request as any).user as JWTPayload;

    logger.info({ userId: id, requesterId: currentUser.sub }, 'Updating user profile');

    // Authorization: Users can only update their own profile
    if (currentUser.sub !== id) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const updatedUser = await userService.updateProfile(id, updates);

    logger.info({ userId: id }, 'User profile updated successfully');

    reply.code(200).send({
      id: updatedUser.id,
      stellarPublicKey: updatedUser.stellarPublicKey,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      affiliation: updatedUser.affiliation,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      reputationScore: updatedUser.reputationScore,
      orcidId: updatedUser.orcidId,
      orcidVerified: updatedUser.orcidVerified,
      emailVerified: updatedUser.emailVerified,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    });
  }

  /**
   * GET /api/v1/users/:id/reputation
   * Fetch user reputation history
   *
   * @public
   * @note Currently returns empty events array - will be populated when reputation service is implemented
   */
  async getReputationHistory(
    request: FastifyRequest<{ Params: UserIdParam }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    logger.info({ userId: id }, 'Fetching reputation history');

    // First verify user exists
    const user = await userService.getUserById(id);

    // TODO: Implement reputation service to fetch actual events
    // For now, return structure with empty events
    // This is the seed of the future SCI-EXPLORER, SCI-REGEN, and SCI-GUARDIAN token economy
    reply.code(200).send({
      userId: user.id,
      currentScore: user.reputationScore,
      events: [],
      totalEvents: 0,
    });
  }
}

// Export singleton instance
export const userController = new UserController();
