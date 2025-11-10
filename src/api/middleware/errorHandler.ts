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

  // Handle custom AppError instances
  if (error instanceof AppError) {
    // Derive error code from name if not explicitly set
    // Converts PascalCase to SNAKE_CASE (e.g., "NotFoundError" -> "NOT_FOUND")
    const errorCode =
      error.code ||
      error.name
        .replace(/Error$/, '') // Remove Error suffix
        .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore between camelCase parts
        .toUpperCase();

    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: errorCode,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    });
  }

  // Handle schema validation errors (from schemaErrorFormatter)
  // These have a validation property attached
  if ((error as any).error === 'VALIDATION_ERROR' || (error as FastifyError).validation) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: error.message,
      validation: (error as any).validation || (error as FastifyError).validation,
    });
  }

  // Handle Fastify errors by status code
  if ((error as FastifyError).statusCode) {
    const statusCode = (error as FastifyError).statusCode || 500;

    // Map status codes to uppercase error codes
    let errorCode: string;
    let errorMessage: string;

    switch (statusCode) {
      case 400:
        errorCode = 'BAD_REQUEST';
        errorMessage = error.message || 'Bad Request';
        break;
      case 401:
        errorCode = 'UNAUTHORIZED';
        errorMessage = error.message || 'Unauthorized';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        errorMessage = error.message || 'Forbidden';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        errorMessage = error.message || 'Not Found';
        break;
      case 409:
        errorCode = 'CONFLICT';
        errorMessage = error.message || 'Conflict';
        break;
      case 500:
        errorCode = 'INTERNAL_SERVER_ERROR';
        errorMessage = 'Internal Server Error';
        break;
      default:
        errorCode = 'ERROR';
        errorMessage = error.message || 'An error occurred';
    }

    return reply.code(statusCode).send({
      statusCode,
      error: errorCode,
      message: errorMessage,
    });
  }

  // Handle unknown errors
  return reply.code(500).send({
    statusCode: 500,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
  });
}
