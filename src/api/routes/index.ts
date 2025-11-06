import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';

/**
 * Register all API routes
 *
 * This is the central registration point for all API endpoints
 */
export async function registerRoutes(server: FastifyInstance) {
  // API v1 routes
  await server.register(async (v1) => {
    // Authentication routes (public)
    await v1.register(authRoutes, { prefix: '/auth' });

    // TODO: Add more route groups in future phases
    // await v1.register(userRoutes, { prefix: '/users' });
    // await v1.register(paperRoutes, { prefix: '/papers' });
    // await v1.register(reviewRoutes, { prefix: '/reviews' });
    // await v1.register(verifyRoutes, { prefix: '/verify' });
  }, { prefix: '/api/v1' });
}
