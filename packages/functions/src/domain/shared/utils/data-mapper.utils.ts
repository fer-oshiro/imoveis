import { Apartment } from '../../apartment/entities/apartment.entity'
import { User } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import {
  UserWithRelation,
  ApartmentWithRelation,
  TimelineEvent,
  PaymentStatusSummary,
  ApartmentListing,
} from '../models/query-result.models'

/**
 * Data mapping utilities for transforming entities into query result models
 */
export class DataMapper {
  /**
   * Maps a User and UserApartmentRelation to UserWithRelation
   */
  static mapUserWithRelation(user: User, relation: UserApartmentRelation): UserWithRelation {
    return {
      user,
      role: relation.role.value,
      relationshipType: relation.relationshipType,
      isActive: relation.isActive,
      relationshipCreatedAt: relation.metadata.createdAt,
      relationshipUpdatedAt: relation.metadata.updatedAt,
    }
  }

  /**
   * Maps an Apartment and UserApartmentRelation to ApartmentWithRelation
   */
  static mapApartmentWithRelation(
    apartment: Apartment,
    relation: UserApartmentRelation,
  ): ApartmentWithRelation {
    return {
      apartment,
      role: relation.role.value,
      relationshipType: relation.relationshipType,
      isActive: relation.isActive,
      relationshipCreatedAt: relation.metadata.createdAt,
      relationshipUpdatedAt: relation.metadata.updatedAt,
    }
  }

  /**
   * Maps an Apartment to ApartmentListing for landing page
   */
  static mapApartmentListing(apartment: Apartment): ApartmentListing {
    const amenities = apartment.amenitiesValue
    const features: string[] = []

    if (amenities.hasCleaningService) features.push('Cleaning Service')
    if (amenities.waterIncluded) features.push('Water Included')
    if (amenities.electricityIncluded) features.push('Electricity Included')

    // Extract location information from address
    const addressParts = apartment.addressValue.split(',').map((part) => part.trim())
    const location = {
      address: apartment.addressValue,
      neighborhood: addressParts.length > 1 ? addressParts[addressParts.length - 2] : undefined,
      city: addressParts.length > 0 ? addressParts[addressParts.length - 1] : undefined,
    }

    return {
      apartment,
      images: apartment.imagesValue,
      isAvailable: apartment.isAvailableValue,
      availableFrom: apartment.availableFromValue,
      airbnbLink: apartment.airbnbLinkValue,
      priceRange: {
        min: apartment.baseRentValue,
        max: apartment.baseRentValue + apartment.cleaningFeeValue,
      },
      features,
      location,
    }
  }

  /**
   * Calculates payment status summary from payments
   */
  static calculatePaymentStatus(payments: Payment[]): PaymentStatusSummary {
    if (payments.length === 0) {
      return { status: 'no_payments' }
    }

    const now = new Date()
    const sortedPayments = payments.sort(
      (a, b) => b.metadataValue.createdAt.getTime() - a.metadataValue.createdAt.getTime(),
    )
    const lastPayment = sortedPayments[0]

    const pendingPayments = payments.filter((p) => p.statusValue === 'pending')
    const overduePayments = payments.filter(
      (p) => p.statusValue === 'pending' && p.dueDateValue < now,
    )

    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amountValue, 0)
    const lastPaymentDate = lastPayment.paymentDateValue || lastPayment.metadataValue.createdAt
    const daysSinceLastPayment = Math.floor(
      (now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    let status: 'current' | 'overdue' | 'no_payments' = 'current'
    if (overduePayments.length > 0) {
      status = 'overdue'
    } else if (pendingPayments.length > 0) {
      // Check if any pending payment is close to due date (within 7 days)
      const upcomingDue = pendingPayments.some(
        (p) => p.dueDateValue.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000,
      )
      status = upcomingDue ? 'current' : 'current'
    }

    return {
      status,
      daysSinceLastPayment,
      totalPendingAmount: totalPendingAmount > 0 ? totalPendingAmount : undefined,
      overdueCount: overduePayments.length > 0 ? overduePayments.length : undefined,
    }
  }

  /**
   * Creates timeline events from various entities
   */
  static createTimelineEvents(
    contracts: Contract[],
    payments: Payment[],
    relations: UserApartmentRelation[],
  ): TimelineEvent[] {
    const events: TimelineEvent[] = []

    // Contract events
    contracts.forEach((contract) => {
      events.push({
        date: contract.startDateValue,
        type: 'contract',
        description: `Contract started with ${contract.tenantPhoneNumberValue}`,
        details: {
          contractId: contract.contractIdValue,
          monthlyRent: contract.monthlyRentValue,
          endDate: contract.endDateValue,
        },
        relatedEntityId: contract.contractIdValue,
      })

      if (contract.statusValue === 'terminated' || contract.statusValue === 'expired') {
        events.push({
          date: contract.endDateValue,
          type: 'contract',
          description: `Contract ${contract.statusValue} with ${contract.tenantPhoneNumberValue}`,
          details: {
            contractId: contract.contractIdValue,
            status: contract.statusValue,
          },
          relatedEntityId: contract.contractIdValue,
        })
      }
    })

    // Payment events
    payments.forEach((payment) => {
      if (payment.paymentDateValue) {
        events.push({
          date: payment.paymentDateValue,
          type: 'payment',
          description: `Payment received from ${payment.userPhoneNumberValue}`,
          details: {
            paymentId: payment.paymentIdValue,
            amount: payment.amountValue,
            status: payment.statusValue,
          },
          relatedEntityId: payment.paymentIdValue,
        })
      }
    })

    // User relationship events
    relations.forEach((relation) => {
      events.push({
        date: relation.metadata.createdAt,
        type: 'user_added',
        description: `User ${relation.userPhoneNumber.formatted} added as ${relation.role.value}`,
        details: {
          role: relation.role.value,
          relationshipType: relation.relationshipType,
        },
        relatedEntityId: relation.userPhoneNumber.value,
      })

      if (!relation.isActive) {
        events.push({
          date: relation.metadata.updatedAt,
          type: 'user_removed',
          description: `User ${relation.userPhoneNumber.formatted} removed as ${relation.role.value}`,
          details: {
            role: relation.role.value,
            relationshipType: relation.relationshipType,
          },
          relatedEntityId: relation.userPhoneNumber.value,
        })
      }
    })

    // Sort events by date (most recent first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  /**
   * Calculates apartment statistics from contracts
   */
  static calculateApartmentStatistics(contracts: Contract[]): {
    totalContracts: number
    averageOccupancyDuration: number
    currentOccupancyDuration?: number
  } {
    const totalContracts = contracts.length

    if (totalContracts === 0) {
      return {
        totalContracts: 0,
        averageOccupancyDuration: 0,
      }
    }

    const completedContracts = contracts.filter(
      (c) => c.statusValue === 'terminated' || c.statusValue === 'expired',
    )

    let totalDuration = 0
    completedContracts.forEach((contract) => {
      const duration = Math.floor(
        (contract.endDateValue.getTime() - contract.startDateValue.getTime()) /
          (1000 * 60 * 60 * 24),
      )
      totalDuration += duration
    })

    const averageOccupancyDuration =
      completedContracts.length > 0 ? Math.floor(totalDuration / completedContracts.length) : 0

    // Calculate current occupancy duration
    const activeContract = contracts.find((c) => c.statusValue === 'active')
    let currentOccupancyDuration: number | undefined

    if (activeContract) {
      currentOccupancyDuration = Math.floor(
        (new Date().getTime() - activeContract.startDateValue.getTime()) / (1000 * 60 * 60 * 24),
      )
    }

    return {
      totalContracts,
      averageOccupancyDuration,
      currentOccupancyDuration,
    }
  }

  /**
   * Calculates payment summary for a user
   */
  static calculateUserPaymentSummary(payments: Payment[]): {
    totalPayments: number
    totalPaidAmount: number
    totalPendingAmount: number
    lastPaymentDate?: Date
    averagePaymentDelay: number
  } {
    const totalPayments = payments.length

    if (totalPayments === 0) {
      return {
        totalPayments: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
        averagePaymentDelay: 0,
      }
    }

    const paidPayments = payments.filter(
      (p) => p.statusValue === 'paid' || p.statusValue === 'validated',
    )
    const pendingPayments = payments.filter((p) => p.statusValue === 'pending')

    const totalPaidAmount = paidPayments.reduce((sum, p) => sum + p.amountValue, 0)
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amountValue, 0)

    // Find last payment date
    const lastPaymentDate =
      paidPayments.length > 0
        ? paidPayments.sort(
            (a, b) => (b.paymentDateValue?.getTime() || 0) - (a.paymentDateValue?.getTime() || 0),
          )[0].paymentDateValue
        : undefined

    // Calculate average payment delay
    let totalDelay = 0
    let delayCount = 0

    paidPayments.forEach((payment) => {
      if (payment.paymentDateValue) {
        const delay = Math.floor(
          (payment.paymentDateValue.getTime() - payment.dueDateValue.getTime()) /
            (1000 * 60 * 60 * 24),
        )
        if (delay > 0) {
          totalDelay += delay
          delayCount++
        }
      }
    })

    const averagePaymentDelay = delayCount > 0 ? Math.floor(totalDelay / delayCount) : 0

    return {
      totalPayments,
      totalPaidAmount,
      totalPendingAmount,
      lastPaymentDate,
      averagePaymentDelay,
    }
  }
}
