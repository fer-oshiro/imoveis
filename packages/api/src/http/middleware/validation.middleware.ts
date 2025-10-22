import { FastifyRequest, FastifyReply } from 'fastify'
import { ZodSchema, ZodError } from 'zod'

import { ValidationError, ErrorHandler } from '../../domain/shared/errors'

/**
 * Middleware to validate request body using Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        const validationError = new ValidationError(`Request body validation failed: ${errors}`)
        const errorResponse = ErrorHandler.handleError(validationError)
        return reply.status(errorResponse.error.statusCode).send(errorResponse)
      }

      const unexpectedError = new ValidationError('Request body validation failed')
      const errorResponse = ErrorHandler.handleError(unexpectedError)
      return reply.status(errorResponse.error.statusCode).send(errorResponse)
    }
  }
}

/**
 * Middleware to validate request parameters using Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        const validationError = new ValidationError(
          `Request parameters validation failed: ${errors}`,
        )
        const errorResponse = ErrorHandler.handleError(validationError)
        return reply.status(errorResponse.error.statusCode).send(errorResponse)
      }

      const unexpectedError = new ValidationError('Request parameters validation failed')
      const errorResponse = ErrorHandler.handleError(unexpectedError)
      return reply.status(errorResponse.error.statusCode).send(errorResponse)
    }
  }
}

/**
 * Middleware to validate request query parameters using Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        const validationError = new ValidationError(`Request query validation failed: ${errors}`)
        const errorResponse = ErrorHandler.handleError(validationError)
        return reply.status(errorResponse.error.statusCode).send(errorResponse)
      }

      const unexpectedError = new ValidationError('Request query validation failed')
      const errorResponse = ErrorHandler.handleError(unexpectedError)
      return reply.status(errorResponse.error.statusCode).send(errorResponse)
    }
  }
}

/**
 * Global error handler middleware for Fastify
 */
export function setupGlobalErrorHandler(fastify: any) {
  fastify.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    // Log the error for debugging
    console.error('Global error handler:', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      body: request.body,
      params: request.params,
      query: request.query,
    })

    const errorResponse = ErrorHandler.handleError(error)
    return reply.status(errorResponse.error.statusCode).send(errorResponse)
  })
}

/**
 * Validation schemas for common request patterns
 */
export const commonValidationSchemas = {
  unitCode: {
    type: 'string',
    minLength: 1,
    maxLength: 20,
    pattern: '^[A-Z0-9-]+$',
    description: 'Apartment unit code (e.g., APT-001)',
  },
  phoneNumber: {
    type: 'string',
    pattern: '^[0-9]{10,11}$',
    description: 'Brazilian phone number (10 or 11 digits)',
  },
  paymentId: {
    type: 'string',
    minLength: 1,
    maxLength: 50,
    description: 'Payment identifier',
  },
  contractId: {
    type: 'string',
    minLength: 1,
    maxLength: 50,
    description: 'Contract identifier',
  },
  dateString: {
    type: 'string',
    format: 'date-time',
    description: 'ISO 8601 date string',
  },
  positiveNumber: {
    type: 'number',
    minimum: 0.01,
    description: 'Positive number greater than zero',
  },
  nonNegativeNumber: {
    type: 'number',
    minimum: 0,
    description: 'Non-negative number',
  },
}
