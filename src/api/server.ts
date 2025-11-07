import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import config from 'config';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from '../utils/logger';
import { prisma, disconnectDatabase } from '../database/client';

/**
 * Build Fastify Server
 *
 * Creates and configures the Fastify server with all plugins and routes
 */
export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      ...logger,
      fatal: logger.error,
      trace: logger.debug,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Security: Helmet - Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // CORS configuration
  const corsOrigins = config.get<string[]>('api.corsOrigins');
  await server.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Rate limiting
  const rateLimitMax = config.get<number>('api.rateLimit.max');
  const rateLimitWindow = config.get<string>('api.rateLimit.window');

  await server.register(rateLimit, {
    max: rateLimitMax,
    timeWindow: rateLimitWindow,
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after}`,
    }),
  });

  // JWT plugin
  const jwtSecret = config.get<string>('auth.jwtSecret');
  await server.register(jwt, {
    secret: jwtSecret,
  });

  // Register all routes
  await registerRoutes(server);

  // Global error handler (must be registered after routes)
  server.setErrorHandler(errorHandler as any);

  // Health check endpoint
  server.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Check if the API is running and database is connected',
    },
    handler: async (request: any, reply: any) => {
      try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return reply.code(200).send({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: config.get<string>('app.version'),
          environment: config.get<string>('app.environment'),
          database: 'connected',
        });
      } catch (error) {
        logger.error('Health check failed', { error });
        return reply.code(503).send({
          status: 'error',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
        });
      }
    },
  } as any);

  // Graceful shutdown handler
  const shutdown = async () => {
    logger.info('Shutting down server...');
    await server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

/**
 * Start Fastify Server
 *
 * Builds and starts the server on configured host and port
 */
export async function startServer(): Promise<FastifyInstance> {
  const server = await buildServer();

  const host = config.get<string>('api.host');
  const port = config.get<number>('api.port');

  try {
    await server.listen({
      port,
      host,
    });

    logger.info(`🚀 Server listening on ${host}:${port}`);
    logger.info(`📚 API documentation available at http://${host}:${port}/documentation`);
    logger.info(`🏥 Health check available at http://${host}:${port}/health`);
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }

  return server;
}

// Start server if this file is executed directly
if (require.main === module) {
  startServer();
}
