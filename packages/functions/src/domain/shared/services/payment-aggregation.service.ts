import { Payment } from '../../payment/entities/payment.entity'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { User } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import {
  PaymentWithDetails,
  PaymentStatistics,
  ContractWithDetails,
} from '../models/query-result.models'
import { DataMapper } from '../utils/data-mapper.utils'
import { DomainError } from '../errors/domain-error'

/**
 * Service for aggregating payment data with related entities
 */
export class PaymentAggregationService {
  /**
   * Aggregates payment with related apartment, user, and contract details
   */
  static async aggregatePaymentWithDetails(
    payment: Payment,
    apartment: Apartment,
    user: User,
    contract?: Contract,
  ): Promise<PaymentWithDetails> {
    try {
      return {
        payment,
        apartment,
        user,
        contract,
      }
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate payment details for ${payment.paymentIdValue}`,
        'PAYMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates contract with payment details and summary
   */
  static async aggregateContractWithDetails(
    contract: Contract,
    apartment: Apartment,
    tenant: User,
    payments: Payment[],
  ): Promise<ContractWithDetails> {
    try {
      const contractPayments = payments.filter(
        (p) => p.contractIdValue === contract.contractIdValue,
      )

      const paymentSummary = DataMapper.calculatePaymentStatus(contractPayments)

      return {
        contract,
        apartment,
        tenant,
        payments: contractPayments.sort(
          (a, b) => b.dueDateValue.getTime() - a.dueDateValue.getTime(),
        ),
        paymentSummary,
      }
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate contract details for ${contract.contractIdValue}`,
        'PAYMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates payment statistics for dashboard
   */
  static async aggregatePaymentStatistics(payments: Payment[]): Promise<PaymentStatistics> {
    try {
      const totalPayments = payments.length

      if (totalPayments === 0) {
        return {
          totalPayments: 0,
          paidPayments: 0,
          pendingPayments: 0,
          overduePayments: 0,
          totalRevenue: 0,
          averagePaymentAmount: 0,
          averagePaymentDelay: 0,
          paymentComplianceRate: 0,
        }
      }

      const paidPayments = payments.filter(
        (p) => p.statusValue === 'paid' || p.statusValue === 'validated',
      )
      const pendingPayments = payments.filter((p) => p.statusValue === 'pending')
      const now = new Date()
      const overduePayments = payments.filter(
        (p) => p.statusValue === 'pending' && p.dueDateValue < now,
      )

      const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amountValue, 0)
      const averagePaymentAmount = totalPayments > 0 ? totalRevenue / paidPayments.length : 0

      // Calculate average payment delay
      let totalDelay = 0
      let delayCount = 0

      paidPayments.forEach((payment) => {
        if (payment.paymentDateValue) {
          const delay = Math.floor(
            (payment.paymentDateValue.getTime() - payment.dueDateValue.getTime()) /
              (1000 * 60 * 60 * 24),
          )
          totalDelay += Math.max(0, delay) // Only count positive delays
          delayCount++
        }
      })

      const averagePaymentDelay = delayCount > 0 ? totalDelay / delayCount : 0

      // Calculate payment compliance rate (payments made on time or early)
      const onTimePayments = paidPayments.filter((payment) => {
        if (!payment.paymentDateValue) return false
        return payment.paymentDateValue <= payment.dueDateValue
      })

      const paymentComplianceRate =
        paidPayments.length > 0 ? (onTimePayments.length / paidPayments.length) * 100 : 0

      return {
        totalPayments,
        paidPayments: paidPayments.length,
        pendingPayments: pendingPayments.length,
        overduePayments: overduePayments.length,
        totalRevenue,
        averagePaymentAmount,
        averagePaymentDelay,
        paymentComplianceRate,
      }
    } catch (error) {
      throw new DomainError('Failed to aggregate payment statistics', 'PAYMENT_AGGREGATION_ERROR')
    }
  }

  /**
   * Aggregates payments by apartment for analysis
   */
  static async aggregatePaymentsByApartment(
    payments: Payment[],
    apartments: Apartment[],
  ): Promise<
    Array<{
      apartment: Apartment
      payments: Payment[]
      totalRevenue: number
      averageMonthlyRevenue: number
      paymentComplianceRate: number
      lastPaymentDate?: Date
    }>
  > {
    try {
      const results = apartments.map((apartment) => {
        const apartmentPayments = payments.filter(
          (p) => p.apartmentUnitCodeValue === apartment.unitCodeValue,
        )

        const paidPayments = apartmentPayments.filter(
          (p) => p.statusValue === 'paid' || p.statusValue === 'validated',
        )

        const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amountValue, 0)

        // Calculate average monthly revenue (assuming payments are monthly)
        const monthsWithPayments = new Set(
          paidPayments.map((p) => {
            const date = p.paymentDateValue || p.dueDateValue
            return `${date.getFullYear()}-${date.getMonth()}`
          }),
        ).size

        const averageMonthlyRevenue = monthsWithPayments > 0 ? totalRevenue / monthsWithPayments : 0

        // Calculate compliance rate
        const onTimePayments = paidPayments.filter((payment) => {
          if (!payment.paymentDateValue) return false
          return payment.paymentDateValue <= payment.dueDateValue
        })

        const paymentComplianceRate =
          paidPayments.length > 0 ? (onTimePayments.length / paidPayments.length) * 100 : 0

        // Find last payment date
        const lastPaymentDate =
          paidPayments.length > 0
            ? paidPayments.sort(
                (a, b) =>
                  (b.paymentDateValue?.getTime() || 0) - (a.paymentDateValue?.getTime() || 0),
              )[0].paymentDateValue
            : undefined

        return {
          apartment,
          payments: apartmentPayments.sort(
            (a, b) => b.dueDateValue.getTime() - a.dueDateValue.getTime(),
          ),
          totalRevenue,
          averageMonthlyRevenue,
          paymentComplianceRate,
          lastPaymentDate,
        }
      })

      // Sort by total revenue (highest first)
      return results.sort((a, b) => b.totalRevenue - a.totalRevenue)
    } catch (error) {
      throw new DomainError(
        'Failed to aggregate payments by apartment',
        'PAYMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates payments by user for analysis
   */
  static async aggregatePaymentsByUser(
    payments: Payment[],
    users: User[],
  ): Promise<
    Array<{
      user: User
      payments: Payment[]
      totalPaid: number
      totalPending: number
      averagePaymentDelay: number
      complianceRate: number
      lastPaymentDate?: Date
    }>
  > {
    try {
      const results = users.map((user) => {
        const userPayments = payments.filter(
          (p) => p.userPhoneNumberValue === user.phoneNumber.value,
        )

        const paidPayments = userPayments.filter(
          (p) => p.statusValue === 'paid' || p.statusValue === 'validated',
        )
        const pendingPayments = userPayments.filter((p) => p.statusValue === 'pending')

        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amountValue, 0)
        const totalPending = pendingPayments.reduce((sum, p) => sum + p.amountValue, 0)

        // Calculate average payment delay
        const paymentSummary = DataMapper.calculateUserPaymentSummary(userPayments)

        // Calculate compliance rate
        const onTimePayments = paidPayments.filter((payment) => {
          if (!payment.paymentDateValue) return false
          return payment.paymentDateValue <= payment.dueDateValue
        })

        const complianceRate =
          paidPayments.length > 0 ? (onTimePayments.length / paidPayments.length) * 100 : 0

        return {
          user,
          payments: userPayments.sort(
            (a, b) => b.dueDateValue.getTime() - a.dueDateValue.getTime(),
          ),
          totalPaid,
          totalPending,
          averagePaymentDelay: paymentSummary.averagePaymentDelay,
          complianceRate,
          lastPaymentDate: paymentSummary.lastPaymentDate,
        }
      })

      // Sort by total paid amount (highest first)
      return results.sort((a, b) => b.totalPaid - a.totalPaid)
    } catch (error) {
      throw new DomainError('Failed to aggregate payments by user', 'PAYMENT_AGGREGATION_ERROR')
    }
  }

  /**
   * Aggregates overdue payments with details
   */
  static async aggregateOverduePayments(
    payments: Payment[],
    apartments: Apartment[],
    users: User[],
  ): Promise<PaymentWithDetails[]> {
    try {
      const now = new Date()
      const overduePayments = payments.filter(
        (p) => p.statusValue === 'pending' && p.dueDateValue < now,
      )

      const results = await Promise.all(
        overduePayments.map(async (payment) => {
          const apartment = apartments.find(
            (a) => a.unitCodeValue === payment.apartmentUnitCodeValue,
          )
          const user = users.find((u) => u.phoneNumber.value === payment.userPhoneNumberValue)

          if (!apartment || !user) {
            throw new DomainError(
              `Missing related entities for payment ${payment.paymentIdValue}`,
              'PAYMENT_AGGREGATION_ERROR',
            )
          }

          return this.aggregatePaymentWithDetails(payment, apartment, user)
        }),
      )

      // Sort by days overdue (most overdue first)
      return results.sort((a, b) => {
        const aDaysOverdue = Math.floor(
          (now.getTime() - a.payment.dueDateValue.getTime()) / (1000 * 60 * 60 * 24),
        )
        const bDaysOverdue = Math.floor(
          (now.getTime() - b.payment.dueDateValue.getTime()) / (1000 * 60 * 60 * 24),
        )
        return bDaysOverdue - aDaysOverdue
      })
    } catch (error) {
      throw new DomainError('Failed to aggregate overdue payments', 'PAYMENT_AGGREGATION_ERROR')
    }
  }
}
