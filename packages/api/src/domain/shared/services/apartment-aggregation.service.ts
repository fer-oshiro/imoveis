import { Apartment } from '../../apartment/entities/apartment.entity'
import { User } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import {
  ApartmentWithPaymentInfo,
  ApartmentDetails,
  ApartmentLog,
  ApartmentListing,
  ApartmentStatistics,
} from '../models/query-result.models'
import { DataMapper } from '../utils/data-mapper.utils'
import { DomainError } from '../errors/domain-error'

/**
 * Service for aggregating apartment data with related entities
 */
export class ApartmentAggregationService {
  /**
   * Aggregates apartment with payment information for admin listing
   */
  static async aggregateApartmentWithPaymentInfo(
    apartment: Apartment,
    payments?: Payment[],
  ): Promise<ApartmentWithPaymentInfo> {
    try {
      const apartmentPayments =
        payments?.filter((p) => p.apartmentUnitCodeValue === apartment.unitCodeValue) || []

      const sortedPayments = apartmentPayments.sort(
        (a, b) => b.metadataValue.createdAt.getTime() - a.metadataValue.createdAt.getTime(),
      )

      const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : undefined
      const paymentStatus = DataMapper.calculatePaymentStatus(apartmentPayments)

      const paidPayments = apartmentPayments.filter(
        (p) => p.statusValue === 'paid' || p.statusValue === 'validated',
      )
      const pendingPayments = apartmentPayments.filter((p) => p.statusValue === 'pending')

      const totalPaidAmount = paidPayments.reduce((sum, p) => sum + p.amountValue, 0)
      const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amountValue, 0)
      return {
        apartment,
        lastPayment,
        paymentStatus,
        totalPayments: apartmentPayments.length,
        totalPaidAmount,
        totalPendingAmount,
      }
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate apartment payment info for ${apartment.unitCodeValue}`,
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates apartment details with users, contracts, and payments
   */
  static async aggregateApartmentDetails(
    apartment: Apartment,
    users: User[],
    relations: UserApartmentRelation[],
    contracts: Contract[],
    payments: Payment[],
  ): Promise<ApartmentDetails> {
    try {
      // Map users with their relationships
      const usersWithRelations = users
        .map((user) => {
          const relation = relations.find(
            (r) =>
              r.apartmentUnitCode === apartment.unitCodeValue &&
              r.userPhoneNumber.value === user.phoneNumber.value,
          )
          return relation ? DataMapper.mapUserWithRelation(user, relation) : null
        })
        .filter((userWithRelation) => userWithRelation !== null) as any[]

      // Find active contract
      const activeContract = contracts.find(
        (c) => c.apartmentUnitCodeValue === apartment.unitCodeValue && c.statusValue === 'active',
      )

      // Get contract history (sorted by start date, most recent first)
      const contractHistory = contracts
        .filter((c) => c.apartmentUnitCodeValue === apartment.unitCodeValue)
        .sort((a, b) => b.startDateValue.getTime() - a.startDateValue.getTime())

      // Get recent payments (last 10 payments)
      const apartmentPayments = payments
        .filter((p) => p.apartmentUnitCodeValue === apartment.unitCodeValue)
        .sort((a, b) => b.metadataValue.createdAt.getTime() - a.metadataValue.createdAt.getTime())
        .slice(0, 10)

      const paymentSummary = DataMapper.calculatePaymentStatus(
        payments.filter((p) => p.apartmentUnitCodeValue === apartment.unitCodeValue),
      )

      return {
        apartment,
        users: usersWithRelations,
        activeContract,
        contractHistory,
        recentPayments: apartmentPayments,
        paymentSummary,
      }
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate apartment details for ${apartment.unitCodeValue}`,
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates apartment log with complete history and timeline
   */
  static async aggregateApartmentLog(
    apartment: Apartment,
    contracts: Contract[],
    payments: Payment[],
    relations: UserApartmentRelation[],
  ): Promise<ApartmentLog> {
    try {
      const apartmentContracts = contracts.filter(
        (c) => c.apartmentUnitCodeValue === apartment.unitCodeValue,
      )
      const apartmentPayments = payments.filter(
        (p) => p.apartmentUnitCodeValue === apartment.unitCodeValue,
      )
      const apartmentRelations = relations.filter(
        (r) => r.apartmentUnitCode === apartment.unitCodeValue,
      )

      // Create timeline events
      const timeline = DataMapper.createTimelineEvents(
        apartmentContracts,
        apartmentPayments,
        apartmentRelations,
      )

      // Calculate statistics
      const contractStats = DataMapper.calculateApartmentStatistics(apartmentContracts)
      const totalRevenue = apartmentPayments
        .filter((p) => p.statusValue === 'paid' || p.statusValue === 'validated')
        .reduce((sum, p) => sum + p.amountValue, 0)

      const statistics = {
        ...contractStats,
        totalPayments: apartmentPayments.length,
        totalRevenue,
      }

      return {
        apartment,
        contracts: apartmentContracts.sort(
          (a, b) => b.startDateValue.getTime() - a.startDateValue.getTime(),
        ),
        payments: apartmentPayments.sort(
          (a, b) => b.metadataValue.createdAt.getTime() - a.metadataValue.createdAt.getTime(),
        ),
        timeline,
        statistics,
      }
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate apartment log for ${apartment.unitCodeValue}`,
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates apartment listing for landing page
   */
  static async aggregateApartmentListing(apartment: Apartment): Promise<ApartmentListing> {
    try {
      return DataMapper.mapApartmentListing(apartment)
    } catch (error) {
      throw new DomainError(
        `Failed to aggregate apartment listing for ${apartment.unitCodeValue}`,
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates multiple apartments with payment info for admin dashboard
   */
  static async aggregateApartmentsWithPaymentInfo(
    apartments: Apartment[],
    allPayments: Payment[],
  ): Promise<ApartmentWithPaymentInfo[]> {
    try {
      const results = await Promise.all(
        apartments.map((apartment) =>
          this.aggregateApartmentWithPaymentInfo(apartment, allPayments),
        ),
      )
      const aaa = results.sort((a, b) =>
        a.apartment.unitCodeValue.localeCompare(b.apartment.unitCodeValue),
      )
      return aaa
    } catch (error) {
      throw new DomainError(
        'Failed to aggregate apartments with payment info',
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates apartment statistics for dashboard
   */
  static async aggregateApartmentStatistics(
    apartments: Apartment[],
    payments: Payment[],
  ): Promise<ApartmentStatistics> {
    try {
      const totalApartments = apartments.length
      const occupiedApartments = apartments.filter((a) => a.statusValue === 'occupied').length
      const availableApartments = apartments.filter((a) => a.statusValue === 'available').length
      const maintenanceApartments = apartments.filter((a) => a.statusValue === 'maintenance').length

      const occupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0

      const totalRent = apartments.reduce((sum, a) => sum + a.baseRentValue, 0)
      const averageRent = totalApartments > 0 ? totalRent / totalApartments : 0

      const currentMonthPayments = payments.filter((p) => {
        const paymentMonth = p.dueDateValue.getMonth()
        const paymentYear = p.dueDateValue.getFullYear()
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        return paymentMonth === currentMonth && paymentYear === currentYear
      })

      const totalMonthlyRevenue = currentMonthPayments
        .filter((p) => p.statusValue === 'paid' || p.statusValue === 'validated')
        .reduce((sum, p) => sum + p.amountValue, 0)

      const airbnbApartments = apartments.filter((a) => a.isAirbnbEnabled()).length
      const longTermApartments = apartments.filter((a) => a.isLongTermEnabled()).length

      return {
        totalApartments,
        occupiedApartments,
        availableApartments,
        maintenanceApartments,
        occupancyRate,
        averageRent,
        totalMonthlyRevenue,
        airbnbApartments,
        longTermApartments,
      }
    } catch (error) {
      throw new DomainError(
        'Failed to aggregate apartment statistics',
        'APARTMENT_AGGREGATION_ERROR',
      )
    }
  }
}
