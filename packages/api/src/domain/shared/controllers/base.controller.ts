import { ZodError } from 'zod'

import { DomainError, ErrorHandler, ErrorResponse } from '../errors'
import { ValidationError } from '../errors/domain-error'

/**
 * Base controller class that provides consistent error handling
 */
export abstract class BaseController {
  /**
   * Execute a controller method with consistent error handling
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      throw this.transformError(error, context)
    }
  }

  /**
   * Transform errors into appropriate domain errors
   */
  private transformError(error: unknown, context: string): Error {
    // If it's already a domain error, pass it through
    if (error instanceof DomainError) {
      return error
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return new ValidationError(`${context} validation failed: ${errors}`)
    }

    // Handle generic validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return new ValidationError(`${context}: ${error.message}`)
    }

    // Handle database/repository errors
    if (
      error instanceof Error &&
      (error.message.includes('DynamoDB') ||
        error.message.includes('database') ||
        error.message.includes('repository'))
    ) {
      return new DomainError(
        `${context} database operation failed: ${error.message}`,
        'DATABASE_ERROR',
        500,
      )
    }

    // Handle network/external service errors
    if (
      error instanceof Error &&
      (error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('connection'))
    ) {
      return new DomainError(
        `${context} external service error: ${error.message}`,
        'EXTERNAL_SERVICE_ERROR',
        503,
      )
    }

    // Log unexpected errors for debugging
    console.error(`Unexpected error in ${context}:`, error)

    // Return generic error for unknown errors
    return new DomainError(
      `An unexpected error occurred during ${context}`,
      'INTERNAL_SERVER_ERROR',
      500,
    )
  }

  /**
   * Handle errors and return appropriate HTTP response
   */
  protected handleError(error: Error): ErrorResponse {
    return ErrorHandler.handleError(error)
  }

  /**
   * Validate input data using a validation function
   */
  protected validateInput<T>(data: unknown, validator: (data: unknown) => T, context: string): T {
    try {
      return validator(data)
    } catch (error) {
      throw this.transformError(error, `${context} input validation`)
    }
  }

  /**
   * Execute operation with input validation
   */
  protected async executeWithValidation<TInput, TOutput>(
    data: unknown,
    validator: (data: unknown) => TInput,
    operation: (validatedData: TInput) => Promise<TOutput>,
    context: string,
  ): Promise<TOutput> {
    return this.executeWithErrorHandling(async () => {
      const validatedData = this.validateInput(data, validator, context)
      return await operation(validatedData)
    }, context)
  }
}
