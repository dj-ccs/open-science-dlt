import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import {
  userProfileResponseJsonSchema,
  updateUserProfileJsonSchema,
  reputationHistoryResponseJsonSchema,
  userIdParamJsonSchema,
} from '../schemas/user.schema';

/**
 * User Routes
 *
 * Defines user profile management and reputation endpoints
 * Prefix: /api/v1/users
 */
export async function userRoutes(server: FastifyInstance) {
  /**
   * GET /users/:id
   * Fetch public user profile
   */
  server.get('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Get user profile',
      description: 'Fetch public user profile information including reputation score',
      params: userIdParamJsonSchema,
      response: {
        200: userProfileResponseJsonSchema,
      },
    },
    handler: userController.getUserProfile.bind(userController),
  } as any);

  /**
   * PATCH /users/:id
   * Update user profile (authenticated, own profile only)
   */
  server.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Update user profile',
      description: 'Update authenticated user profile. Users can only update their own profile.',
      security: [{ bearerAuth: [] }],
      params: userIdParamJsonSchema,
      body: updateUserProfileJsonSchema,
      response: {
        200: userProfileResponseJsonSchema,
      },
    },
    handler: userController.updateUserProfile.bind(userController),
  } as any);

  /**
   * GET /users/:id/reputation
   * Get user reputation history
   *
   * Returns reputation score and event history.
   * This is the foundation for the future SCI-EXPLORER, SCI-REGEN, and SCI-GUARDIAN tokens.
   */
  server.get('/:id/reputation', {
    schema: {
      tags: ['Users'],
      summary: 'Get reputation history',
      description:
        'Fetch user reputation score and complete event history. Foundation for token rewards.',
      params: userIdParamJsonSchema,
      response: {
        200: reputationHistoryResponseJsonSchema,
      },
    },
    handler: userController.getReputationHistory.bind(userController),
  } as any);
}
