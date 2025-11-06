import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import {
  stellarAuthRequestSchema,
  stellarAuthResponseSchema,
  emailAuthRequestSchema,
  registerRequestSchema,
  registerResponseSchema,
  refreshTokenRequestSchema,
  refreshTokenResponseSchema,
  generateChallengeResponseSchema,
  currentUserResponseSchema,
} from '../schemas/auth.schema';

/**
 * Authentication Routes
 *
 * Defines all authentication-related endpoints
 */
export async function authRoutes(server: FastifyInstance) {
  /**
   * Generate authentication challenge for Stellar signature
   */
  server.get('/challenge', {
    schema: {
      tags: ['Authentication'],
      summary: 'Generate authentication challenge',
      description: 'Generate a time-limited challenge for Stellar signature authentication',
      response: {
        200: generateChallengeResponseSchema,
      },
    },
    handler: authController.generateChallenge.bind(authController),
  });

  /**
   * Authenticate with Stellar public key signature
   */
  server.post('/stellar', {
    schema: {
      tags: ['Authentication'],
      summary: 'Authenticate with Stellar signature',
      description: 'Authenticate using Stellar public key signature verification',
      body: stellarAuthRequestSchema,
      response: {
        200: stellarAuthResponseSchema,
      },
    },
    handler: authController.authenticateWithStellar.bind(authController),
  });

  /**
   * Authenticate with email/password
   */
  server.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Login with email/password',
      description: 'Authenticate using email and password credentials',
      body: emailAuthRequestSchema,
      response: {
        200: stellarAuthResponseSchema,
      },
    },
    handler: authController.loginWithEmail.bind(authController),
  });

  /**
   * Register new user
   */
  server.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register new user',
      description: 'Create a new user account with Stellar public key',
      body: registerRequestSchema,
      response: {
        201: registerResponseSchema,
      },
    },
    handler: authController.register.bind(authController),
  });

  /**
   * Refresh access token
   */
  server.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Get a new access token using a valid refresh token',
      body: refreshTokenRequestSchema,
      response: {
        200: refreshTokenResponseSchema,
      },
    },
    handler: authController.refreshToken.bind(authController),
  });

  /**
   * Logout (revoke session)
   */
  server.post('/logout', {
    preHandler: [authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Logout',
      description: 'Revoke current session and logout',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: authController.logout.bind(authController),
  });

  /**
   * Get current user profile
   */
  server.get('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user',
      description: 'Get authenticated user profile information',
      security: [{ bearerAuth: [] }],
      response: {
        200: currentUserResponseSchema,
      },
    },
    handler: authController.getCurrentUser.bind(authController),
  });
}
