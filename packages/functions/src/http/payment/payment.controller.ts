import { PaymentService } from '../../domain/payment/services/payment.service'
import { PaymentRepository } from '../../domain/payment/repositories/payment.repository'
import {
  CreatePaymentDto,
  SubmitPaymentProofDto,
  ValidatePaymentDto,
  UpdatePaymentDto,
} from '../../domain/payment/dto'
import { PaymentStatus } from '../../domain/payment/vo/payment-enums.vo'
import { DomainError } from '../../domain/shared/errors/domain-error'

export class PaymentController {
  private paymentService: PaymentService

  constructor() {
    const paymentRepository = PaymentRepository.getInstance()
    this.paymentService = new PaymentService(paymentRepository)
  }

  // Get payment by ID
  async getPaymentById(paymentId: string) {
    try {
      const payment = await this.paymentService.getPaymentById(paymentId)
      if (!payment) {
        throw new DomainError(`Payment with ID ${paymentId} not found`, 'PAYMENT_NOT_FOUND', 404)
      }
      return payment
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payment', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by apartment
  async getPaymentsByApartment(apartmentUnitCode: string) {
    try {
      return await this.paymentService.getPaymentsByApartment(apartmentUnitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payments by apartment', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get last payment by apartment
  async getLastPaymentByApartment(apartmentUnitCode: string) {
    try {
      return await this.paymentService.getLastPaymentByApartment(apartmentUnitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get last payment by apartment', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by user
  async getPaymentsByUser(userPhoneNumber: string) {
    try {
      return await this.paymentService.getPaymentsByUser(userPhoneNumber)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payments by user', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by contract
  async getPaymentsByContract(contractId: string) {
    try {
      return await this.paymentService.getPaymentsByContract(contractId)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payments by contract', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by status
  async getPaymentsByStatus(status: PaymentStatus) {
    try {
      return await this.paymentService.getPaymentsByStatus(status)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payments by status', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get overdue payments
  async getOverduePayments() {
    try {
      return await this.paymentService.getOverduePayments()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get overdue payments', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get pending payments
  async getPendingPayments() {
    try {
      return await this.paymentService.getPendingPayments()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get pending payments', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by date range
  async getPaymentsByDateRange(startDate: string, endDate: string) {
    try {
      return await this.paymentService.getPaymentsByDateRange(
        new Date(startDate),
        new Date(endDate),
      )
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payments by date range', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payments by apartment and date range
  async getPaymentsByApartmentAndDateRange(
    apartmentUnitCode: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      return await this.paymentService.getPaymentsByApartmentAndDateRange(
        apartmentUnitCode,
        new Date(startDate),
        new Date(endDate),
      )
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError(
        'Failed to get payments by apartment and date range',
        'PAYMENT_QUERY_ERROR',
      )
    }
  }

  // Create new payment
  async createPayment(dto: CreatePaymentDto) {
    try {
      return await this.paymentService.createPayment(dto)
    } catch (error) {
      if (error instanceof Error) {
        throw new DomainError(error.message, 'PAYMENT_CREATE_ERROR', 400)
      }
      throw new DomainError('Failed to create payment', 'PAYMENT_CREATE_ERROR')
    }
  }

  // Submit payment proof
  async submitPaymentProof(dto: SubmitPaymentProofDto) {
    try {
      return await this.paymentService.submitPaymentProof(dto)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'PAYMENT_NOT_FOUND', 404)
        }
        throw new DomainError(error.message, 'PAYMENT_UPDATE_ERROR', 400)
      }
      throw new DomainError('Failed to submit payment proof', 'PAYMENT_UPDATE_ERROR')
    }
  }

  // Validate payment
  async validatePayment(dto: ValidatePaymentDto) {
    try {
      return await this.paymentService.validatePayment(dto)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'PAYMENT_NOT_FOUND', 404)
        }
        throw new DomainError(error.message, 'PAYMENT_VALIDATION_ERROR', 400)
      }
      throw new DomainError('Failed to validate payment', 'PAYMENT_VALIDATION_ERROR')
    }
  }

  // Update payment
  async updatePayment(paymentId: string, dto: UpdatePaymentDto) {
    try {
      return await this.paymentService.updatePayment(paymentId, dto)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'PAYMENT_NOT_FOUND', 404)
        }
        throw new DomainError(error.message, 'PAYMENT_UPDATE_ERROR', 400)
      }
      throw new DomainError('Failed to update payment', 'PAYMENT_UPDATE_ERROR')
    }
  }

  // Delete payment
  async deletePayment(paymentId: string) {
    try {
      await this.paymentService.deletePayment(paymentId)
      return { message: 'Payment deleted successfully' }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'PAYMENT_NOT_FOUND', 404)
        }
        if (error.message.includes('Cannot delete a validated payment')) {
          throw new DomainError(error.message, 'PAYMENT_BUSINESS_RULE_ERROR', 409)
        }
        throw new DomainError(error.message, 'PAYMENT_DELETE_ERROR', 400)
      }
      throw new DomainError('Failed to delete payment', 'PAYMENT_DELETE_ERROR')
    }
  }

  // Mark overdue payments
  async markOverduePayments() {
    try {
      const overduePayments = await this.paymentService.markOverduePayments()
      return {
        message: `Marked ${overduePayments.length} payments as overdue`,
        overduePayments,
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to mark overdue payments', 'PAYMENT_UPDATE_ERROR')
    }
  }

  // Get payment statistics by apartment
  async getPaymentStatsByApartment(apartmentUnitCode: string) {
    try {
      return await this.paymentService.getPaymentStatsByApartment(apartmentUnitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payment statistics by apartment', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Get payment statistics by user
  async getPaymentStatsByUser(userPhoneNumber: string) {
    try {
      return await this.paymentService.getPaymentStatsByUser(userPhoneNumber)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get payment statistics by user', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Legacy methods for backward compatibility
  // Get all payment proofs (legacy comprovantes endpoint)
  async getAllPaymentProofs() {
    try {
      const payments = await this.paymentService.getAllPaymentProofs()
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: payments.sort((a: any, b: any) =>
            a.apartmentUnitCode.localeCompare(b.apartmentUnitCode),
          ),
          total: payments.length,
        }),
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get all payment proofs', 'PAYMENT_QUERY_ERROR')
    }
  }

  // Submit legacy payment proof (legacy comprovantes POST endpoint)
  async submitLegacyPaymentProof(body: any) {
    try {
      // Validate legacy format
      const dataDeposito = body.dataDeposito
      if (!dataDeposito) {
        throw new DomainError('dataDeposito is required', 'PAYMENT_VALIDATION_ERROR', 400)
      }
      if (dataDeposito.startsWith('T')) {
        throw new DomainError('Invalid date format', 'PAYMENT_VALIDATION_ERROR', 400)
      }
      if (dataDeposito.split('T')[1]?.length !== 13) {
        throw new DomainError('Invalid time format', 'PAYMENT_VALIDATION_ERROR', 400)
      }

      const date = new Date(dataDeposito)
      if (isNaN(date.getTime())) {
        throw new DomainError('Invalid date', 'PAYMENT_VALIDATION_ERROR', 400)
      }

      await this.paymentService.submitLegacyPaymentProof(body)
      return {
        statusCode: 200,
        body: 'success',
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to submit legacy payment proof', 'PAYMENT_CREATE_ERROR')
    }
  }
}
