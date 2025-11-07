import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../../utils/logger';
import { AppError } from '../../types/errors.types';

/**
 * Global Error Handler
 *
 * Handles all errors thrown in the application and returns
 * appropriate HTTP responses with structured error messages
 */
export async function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error with context
  logger.error('Request error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
      },
    },
  });

  // Handle custom AppError
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    });
  }

  // Handle Fastify validation errors
  if ((error as FastifyError).validation) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
      validation: (error as FastifyError).validation,
    });
  }

  // Handle Fastify errors
  if ((error as FastifyError).statusCode) {
    const statusCode = (error as FastifyError).statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    return reply.code(statusCode).send({
      statusCode,
      error: error.name || 'Error',
      message,
    });
  }

  // Handle unknown errors
  return reply.code(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
  });
}
