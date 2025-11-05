import { logger } from '../../../infra/logger'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import { User } from '../../user/entities/user.entity'
import { DomainError } from '../errors/domain-error'
import {
  type UserDetails,
  type UserStatistics,
  type UserWithRelation,
} from '../models/query-result.models'
import { DataMapper } from '../utils/data-mapper.utils'

/**
 * Service for aggregating user data with related entities
 */
export class UserAggregationService {
  /**
   * Aggregates user details with relationships, apartments, and payment history
   */
  static async aggregateUserDetails(
    user: User,
    relatedUsers: User[],
    userRelations: UserApartmentRelation[],
    relatedUserRelations: UserApartmentRelation[],
    apartments: Apartment[],
    payments: Payment[],
    allRelations: UserApartmentRelation[],
  ): Promise<UserDetails> {
    try {
      // Map related users with their relationships to the main user
      const relatedUsersWithRelations = relatedUsers
        .map((relatedUser) => {
          // Find relationships where the related user is connected to the same apartments as the main user
          const sharedApartmentRelations = relatedUserRelations.filter((relation) => {
            // Check if this related user has a relationship to an apartment that the main user also has
            return userRelations.some(
              (userRel) =>
                userRel.apartmentUnitCode === relation.apartmentUnitCode &&
                relation.userPhoneNumber.value === relatedUser.phoneNumber.value,
            )
          })

          // For now, use the first shared relationship to determine the connection
          const primaryRelation = sharedApartmentRelations[0]
          if (!primaryRelation) return null

          return DataMapper.mapUserWithRelation(relatedUser, primaryRelation)
        })
        .filter((userWithRelation) => userWithRelation !== null) as UserWithRelation[]

      // Map apartments with user's relationships to them
      const apartmentsWithRelations = apartments
        .map((apartment) => {
          const relation = userRelations.find(
            (r) =>
              r.apartmentUnitCode === apartment.unitCodeValue &&
              r.userPhoneNumber.value === user.phoneNumber.value,
          )
          return relation ? DataMapper.mapApartmentWithRelation(apartment, relation) : null
        })
        .filter((apartmentWithRelation) => apartmentWithRelation !== null) as any[]

      // Filter payments for this user
      const userPayments = payments
        .filter((p) => p.userPhoneNumberValue === user.phoneNumber.value)
        .sort((a, b) => b.metadataValue.createdAt.getTime() - a.metadataValue.createdAt.getTime())

      // Calculate payment summary
      const paymentSummary = DataMapper.calculateUserPaymentSummary(userPayments)

      // Get all relationships for this user
      const userRelationships = allRelations.filter(
        (r) => r.userPhoneNumber.value === user.phoneNumber.value,
      )

      return {
        user,
        relatedUsers: relatedUsersWithRelations,
        apartments: apartmentsWithRelations,
        paymentHistory: userPayments,
        paymentSummary,
        relationships: userRelationships,
      }
    } catch (error) {
      logger.error(error)
      throw new DomainError(
        `Failed to aggregate user details for ${user.phoneNumber.value}`,
        'USER_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates users with their relationships for a specific apartment
   */
  static async aggregateUsersForApartment(
    users: User[],
    relations: UserApartmentRelation[],
    apartmentUnitCode: string,
  ): Promise<UserWithRelation[]> {
    try {
      const apartmentRelations = relations.filter((r) => r.apartmentUnitCode === apartmentUnitCode)

      const usersWithRelations = users
        .map((user) => {
          const relation = apartmentRelations.find(
            (r) => r.userPhoneNumber.value === user.phoneNumber.value,
          )
          return relation ? DataMapper.mapUserWithRelation(user, relation) : null
        })
        .filter((userWithRelation) => userWithRelation !== null) as UserWithRelation[]

      // Sort by role priority (primary tenant first, then secondary, etc.)
      const rolePriority = {
        primary_tenant: 1,
        secondary_tenant: 2,
        emergency_contact: 3,
        admin: 4,
        ops: 5,
      }

      return usersWithRelations.sort((a, b) => {
        const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 999
        const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 999
        return aPriority - bPriority
      })
    } catch (error) {
      logger.error(error)
      throw new DomainError(
        `Failed to aggregate users for apartment ${apartmentUnitCode}`,
        'USER_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates related users for a specific user (users who share apartments)
   */
  static async aggregateRelatedUsers(
    mainUser: User,
    allUsers: User[],
    allRelations: UserApartmentRelation[],
  ): Promise<UserWithRelation[]> {
    try {
      // Get all apartments that the main user is related to
      const mainUserApartments = allRelations
        .filter((r) => r.userPhoneNumber.value === mainUser.phoneNumber.value)
        .map((r) => r.apartmentUnitCode)

      // Find all users who are related to the same apartments
      const relatedUserPhones = new Set<string>()

      allRelations
        .filter(
          (r) =>
            mainUserApartments.includes(r.apartmentUnitCode) &&
            r.userPhoneNumber.value !== mainUser.phoneNumber.value,
        )
        .forEach((r) => relatedUserPhones.add(r.userPhoneNumber.value))

      // Get the related users and their relationships
      const relatedUsersWithRelations: UserWithRelation[] = []

      for (const phoneNumber of Array.from(relatedUserPhones)) {
        const relatedUser = allUsers.find((u) => u.phoneNumber.value === phoneNumber)
        if (!relatedUser) continue

        // Find the primary relationship (prefer relationships in the same apartment as main user)
        const userRelations = allRelations.filter((r) => r.userPhoneNumber.value === phoneNumber)

        // Prefer relationships in apartments shared with the main user
        const sharedRelation = userRelations.find((r) =>
          mainUserApartments.includes(r.apartmentUnitCode),
        )

        const primaryRelation = sharedRelation || userRelations[0]
        if (primaryRelation) {
          relatedUsersWithRelations.push(
            DataMapper.mapUserWithRelation(relatedUser, primaryRelation),
          )
        }
      }

      return relatedUsersWithRelations.sort((a, b) => a.user.name.localeCompare(b.user.name))
    } catch (error) {
      logger.error(error)
      throw new DomainError(
        `Failed to aggregate related users for ${mainUser.phoneNumber.value}`,
        'USER_AGGREGATION_ERROR',
      )
    }
  }

  /**
   * Aggregates user statistics for dashboard
   */
  static async aggregateUserStatistics(
    users: User[],
    relations: UserApartmentRelation[],
  ): Promise<UserStatistics> {
    try {
      const totalUsers = users.length
      const activeUsers = users.filter((u) => u.status === 'active').length
      const inactiveUsers = users.filter((u) => u.status === 'inactive').length
      const suspendedUsers = users.filter((u) => u.status === 'suspended').length

      // Count users by role (using active relationships only)
      const activeRelations = relations.filter((r) => r.isActive)
      const primaryTenants = new Set(
        activeRelations
          .filter((r) => r.role.value === 'primary_tenant')
          .map((r) => r.userPhoneNumber.value),
      ).size

      const secondaryTenants = new Set(
        activeRelations
          .filter((r) => r.role.value === 'secondary_tenant')
          .map((r) => r.userPhoneNumber.value),
      ).size

      const emergencyContacts = new Set(
        activeRelations
          .filter((r) => r.role.value === 'emergency_contact')
          .map((r) => r.userPhoneNumber.value),
      ).size

      const adminUsers = new Set(
        activeRelations.filter((r) => r.role.value === 'admin').map((r) => r.userPhoneNumber.value),
      ).size

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        primaryTenants,
        secondaryTenants,
        emergencyContacts,
        adminUsers,
      }
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to aggregate user statistics', 'USER_AGGREGATION_ERROR')
    }
  }

  /**
   * Finds users who might be related based on shared apartments or similar information
   */
  static async findPotentialRelatedUsers(
    mainUser: User,
    allUsers: User[],
    allRelations: UserApartmentRelation[],
  ): Promise<User[]> {
    try {
      const potentialRelatedUsers: User[] = []

      // Get apartments associated with the main user
      const mainUserApartments = allRelations
        .filter((r) => r.userPhoneNumber.value === mainUser.phoneNumber.value)
        .map((r) => r.apartmentUnitCode)

      // Find users in the same apartments
      const sameApartmentUsers = allUsers.filter((user) => {
        if (user.phoneNumber.value === mainUser.phoneNumber.value) return false

        return allRelations.some(
          (r) =>
            r.userPhoneNumber.value === user.phoneNumber.value &&
            mainUserApartments.includes(r.apartmentUnitCode),
        )
      })

      potentialRelatedUsers.push(...sameApartmentUsers)

      // Find users with similar names (could be family members)
      const nameParts = mainUser.name.toLowerCase().split(' ')
      const similarNameUsers = allUsers.filter((user) => {
        if (user.phoneNumber.value === mainUser.phoneNumber.value) return false
        if (potentialRelatedUsers.some((u) => u.phoneNumber.value === user.phoneNumber.value))
          return false

        const userNameParts = user.name.toLowerCase().split(' ')
        return nameParts.some((part) => userNameParts.includes(part))
      })

      potentialRelatedUsers.push(...similarNameUsers)

      return potentialRelatedUsers
    } catch (error) {
      logger.error(error)
      throw new DomainError(
        `Failed to find potential related users for ${mainUser.phoneNumber.value}`,
        'USER_AGGREGATION_ERROR',
      )
    }
  }
}
