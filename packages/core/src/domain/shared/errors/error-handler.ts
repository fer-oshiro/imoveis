import { DomainError } from './domain-error'
import { logger } from '../../../infra/logger'

export interface ErrorResponse {
  error: {
    code: string
    message: string
    statusCode: number
  }
}

export class ErrorHandler {
  static handleError(error: Error): ErrorResponse {
    if (error instanceof DomainError) {
      return {
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
        },
      }
    }

    logger.error(error)

    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    }
  }

  static isRetryableError(error: Error): boolean {
    if (error instanceof DomainError) {
      return error.statusCode >= 500
    }
    return true // Assume unknown errors are retryable
  }
}
