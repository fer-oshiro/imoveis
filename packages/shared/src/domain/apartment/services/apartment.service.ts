import { logger } from '../../../infra/logger'
import { Contract } from '../../contract/entities/contract.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import { ApartmentAggregationService, BusinessRuleViolationError, DomainError } from '../../shared'
import {
  type ApartmentDetails,
  type ApartmentListing,
  type ApartmentLog,
} from '../../shared/models/query-result.models'
import { User } from '../../user/entities/user.entity'
import { type ApartmentQueryDto, type CreateApartmentDto, type UpdateApartmentDto } from '../dto'
import { Apartment } from '../entities/apartment.entity'
import {
  ApartmentAlreadyExistsError,
  ApartmentCreateError,
  ApartmentNotFoundError,
  ApartmentOccupiedError,
  ApartmentUpdateError,
  InvalidApartmentStatusTransitionError,
} from '../errors'
import {
  type IApartmentRepository,
  ApartmentRepository,
} from '../repositories/apartment.repository'
import { ApartmentStatus, RentalType } from '../vo/apartment-enums.vo'

export default class ApartmentService {
  private apartmentRepository: IApartmentRepository

  constructor(apartmentRepository?: IApartmentRepository) {
    this.apartmentRepository = apartmentRepository || ApartmentRepository.getInstance()
  }

  // Main usage: list apartments with last payment info (admin view)
  async getApartmentsWithLastPayment(): Promise<Apartment[]> {
    try {
      const apartments = (await this.apartmentRepository.findAll()).sort((a, b) =>
        a.unitCodeValue.localeCompare(b.unitCodeValue),
      )
      return apartments
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get apartments with payment info', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Landing page: list available apartments
  async getAvailableApartments(): Promise<ApartmentListing[]> {
    try {
      const apartments = await this.apartmentRepository.findAvailable()
      const longTermApartments = apartments.filter((apartment) => apartment.isLongTermEnabled())

      return await Promise.all(
        longTermApartments.map((apartment) =>
          ApartmentAggregationService.aggregateApartmentListing(apartment),
        ),
      )
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get available apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Landing page: list Airbnb apartments
  async getAirbnbApartments(): Promise<ApartmentListing[]> {
    try {
      const apartments = await this.apartmentRepository.findAirbnbApartments()

      return await Promise.all(
        apartments.map((apartment) =>
          ApartmentAggregationService.aggregateApartmentListing(apartment),
        ),
      )
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get Airbnb apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Apartment details with related users and contracts
  async getApartmentDetails(
    unitCode: string,
    users: User[] = [],
    relations: UserApartmentRelation[] = [],
    contracts: Contract[] = [],
    payments: Payment[] = [],
  ): Promise<ApartmentDetails> {
    try {
      const apartment = await this.apartmentRepository.findByUnitCode(unitCode)
      if (!apartment) {
        throw new DomainError(
          `Apartment with unit code ${unitCode} not found`,
          'APARTMENT_NOT_FOUND',
          404,
        )
      }

      return await ApartmentAggregationService.aggregateApartmentDetails(
        apartment,
        users,
        relations,
        contracts,
        payments,
      )
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartment details', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Apartment log with contracts and payments history
  async getApartmentLog(
    unitCode: string,
    contracts: Contract[] = [],
    payments: Payment[] = [],
    relations: UserApartmentRelation[] = [],
  ): Promise<ApartmentLog> {
    try {
      const apartment = await this.apartmentRepository.findByUnitCode(unitCode)
      if (!apartment) {
        throw new DomainError(
          `Apartment with unit code ${unitCode} not found`,
          'APARTMENT_NOT_FOUND',
          404,
        )
      }

      return await ApartmentAggregationService.aggregateApartmentLog(
        apartment,
        contracts,
        payments,
        relations,
      )
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartment log', 'APARTMENT_QUERY_ERROR')
    }
  }

  async createApartment(dto: CreateApartmentDto, createdBy?: string): Promise<Apartment> {
    try {
      // Business rule: Check if apartment with same unit code already exists
      await this.validateUniqueUnitCode(dto.unitCode)

      // Business rule: Validate rental amount is reasonable
      this.validateRentalAmount(dto.baseRent)

      // Business rule: Validate Airbnb link if provided
      if (dto.airbnbLink) {
        this.validateAirbnbLink(dto.airbnbLink)
      }

      // Business rule: If apartment is marked as available, validate availability date
      if (dto.isAvailable && dto.availableFrom) {
        this.validateAvailabilityDate(dto.availableFrom)
      }

      const apartment = Apartment.create({
        unitCode: dto.unitCode,
        unitLabel: dto.unitLabel,
        address: dto.address,
        baseRent: dto.baseRent,
        contactPhone: dto.contactPhone,
        status: dto.status as ApartmentStatus,
        rentalType: dto.rentalType as RentalType,
        cleaningFee: dto.cleaningFee,
        images: dto.images,
        amenities: dto.amenities,
        contactMethod: dto.contactMethod,
        airbnbLink: dto.airbnbLink,
        isAvailable: dto.isAvailable,
        availableFrom: dto.availableFrom,
        createdBy,
      })

      return await this.apartmentRepository.save(apartment)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new ApartmentCreateError('Failed to create apartment', error as Error)
    }
  }

  async updateApartment(
    unitCode: string,
    dto: UpdateApartmentDto,
    updatedBy?: string,
  ): Promise<Apartment> {
    try {
      const apartment = await this.apartmentRepository.findByUnitCode(unitCode)
      if (!apartment) {
        throw new ApartmentNotFoundError(unitCode)
      }

      // Business rule validations
      if (dto.status !== undefined) {
        this.validateStatusTransition(apartment.statusValue, dto.status as ApartmentStatus)
      }

      if (dto.baseRent !== undefined) {
        this.validateRentalAmount(dto.baseRent)
      }

      if (dto.airbnbLink !== undefined && dto.airbnbLink) {
        this.validateAirbnbLink(dto.airbnbLink)
      }

      if (dto.availableFrom) {
        this.validateAvailabilityDate(dto.availableFrom)
      }

      // Apply updates
      if (dto.status !== undefined) {
        if (dto.status === ApartmentStatus.AVAILABLE) {
          apartment.markAsAvailable(dto.availableFrom, updatedBy)
        } else if (dto.status === ApartmentStatus.OCCUPIED) {
          apartment.markAsOccupied(updatedBy)
        } else if (dto.status === ApartmentStatus.INACTIVE) {
          apartment.markAsInactive(updatedBy)
        }
      }

      if (dto.rentalType !== undefined) {
        apartment.updateRentalType(dto.rentalType as RentalType, updatedBy)
      }

      if (dto.airbnbLink !== undefined) {
        apartment.updateAirbnbLink(dto.airbnbLink || undefined, updatedBy)
      }

      if (dto.baseRent !== undefined || dto.cleaningFee !== undefined) {
        apartment.updatePricing(dto.baseRent ?? apartment.baseRentValue, dto.cleaningFee, updatedBy)
      }

      return await this.apartmentRepository.update(unitCode, apartment)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new ApartmentUpdateError('Failed to update apartment', error as Error)
    }
  }

  async deactivateApartment(unitCode: string, updatedBy?: string): Promise<void> {
    try {
      const apartment = await this.apartmentRepository.findByUnitCode(unitCode)
      if (!apartment) {
        throw new DomainError(
          `Apartment with unit code ${unitCode} not found`,
          'APARTMENT_NOT_FOUND',
          404,
        )
      }

      apartment.markAsInactive(updatedBy)
      await this.apartmentRepository.update(unitCode, apartment)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to deactivate apartment', 'APARTMENT_UPDATE_ERROR')
    }
  }

  async getApartmentByUnitCode(unitCode: string): Promise<Apartment | null> {
    try {
      return await this.apartmentRepository.findByUnitCode(unitCode)
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get apartment', 'APARTMENT_QUERY_ERROR')
    }
  }

  async getApartmentsByStatus(status: ApartmentStatus): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findByStatus(status)
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get apartments by status', 'APARTMENT_QUERY_ERROR')
    }
  }

  async getApartmentsByRentalType(rentalType: RentalType): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findByRentalType(rentalType)
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to get apartments by rental type', 'APARTMENT_QUERY_ERROR')
    }
  }

  async queryApartments(query: ApartmentQueryDto): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findWithQuery(query)
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to query apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Legacy methods for backward compatibility
  async getApartments() {
    const apartments = await this.apartmentRepository.findAll()
    return apartments.sort((a, b) => a.unitCodeValue.localeCompare(b.unitCodeValue))
  }

  async createApartmentLegacy(apartmentData: any) {
    return await this.apartmentRepository.save(apartmentData)
  }

  // Additional methods referenced by controllers
  async getApartmentUsers(unitCode: string) {
    logger.info(unitCode)
    // This would typically require the relationship service
    // For now, return empty array to maintain compatibility
    return []
  }

  async getApartmentContracts(unitCode: string) {
    logger.info(unitCode)
    // This would typically require the contract service
    // For now, return empty array to maintain compatibility
    return []
  }

  async getApartmentPayments(unitCode: string) {
    logger.info(unitCode)
    // This would typically require the payment service
    // For now, return empty array to maintain compatibility
    return []
  }

  // Business rule validation methods
  private async validateUniqueUnitCode(unitCode: string): Promise<void> {
    const existingApartment = await this.apartmentRepository.findByUnitCode(unitCode)
    if (existingApartment) {
      throw new ApartmentAlreadyExistsError(unitCode)
    }
  }

  private validateRentalAmount(amount: number): void {
    if (amount <= 0) {
      throw new BusinessRuleViolationError('Rental amount must be greater than zero')
    }

    // Business rule: Rental amount should be reasonable (between R$500 and R$10,000)
    if (amount < 500) {
      throw new BusinessRuleViolationError('Rental amount is too low (minimum R$500)')
    }

    if (amount > 10000) {
      throw new BusinessRuleViolationError('Rental amount is too high (maximum R$10,000)')
    }
  }

  private validateAirbnbLink(link: string): void {
    try {
      const url = new URL(link)
      if (!url.hostname.includes('airbnb.com')) {
        throw new BusinessRuleViolationError('Airbnb link must be from airbnb.com domain')
      }
    } catch {
      throw new BusinessRuleViolationError('Invalid Airbnb link format')
    }
  }

  private validateAvailabilityDate(availableFrom: Date): void {
    const now = new Date()
    const maxFutureDate = new Date()
    maxFutureDate.setFullYear(now.getFullYear() + 1) // Max 1 year in the future

    if (availableFrom < now) {
      throw new BusinessRuleViolationError('Availability date cannot be in the past')
    }

    if (availableFrom > maxFutureDate) {
      throw new BusinessRuleViolationError(
        'Availability date cannot be more than 1 year in the future',
      )
    }
  }

  private validateStatusTransition(
    currentStatus: ApartmentStatus,
    newStatus: ApartmentStatus,
  ): void {
    const validTransitions: Record<ApartmentStatus, ApartmentStatus[]> = {
      [ApartmentStatus.AVAILABLE]: [
        ApartmentStatus.OCCUPIED,
        ApartmentStatus.MAINTENANCE,
        ApartmentStatus.INACTIVE,
      ],
      [ApartmentStatus.OCCUPIED]: [
        ApartmentStatus.AVAILABLE,
        ApartmentStatus.MAINTENANCE,
        ApartmentStatus.INACTIVE,
      ],
      [ApartmentStatus.VACANT]: [
        ApartmentStatus.AVAILABLE,
        ApartmentStatus.OCCUPIED,
        ApartmentStatus.MAINTENANCE,
        ApartmentStatus.INACTIVE,
      ],
      [ApartmentStatus.RESERVED]: [
        ApartmentStatus.OCCUPIED,
        ApartmentStatus.AVAILABLE,
        ApartmentStatus.MAINTENANCE,
        ApartmentStatus.INACTIVE,
      ],
      [ApartmentStatus.MAINTENANCE]: [
        ApartmentStatus.AVAILABLE,
        ApartmentStatus.VACANT,
        ApartmentStatus.INACTIVE,
      ],
      [ApartmentStatus.INACTIVE]: [
        ApartmentStatus.AVAILABLE,
        ApartmentStatus.VACANT,
        ApartmentStatus.MAINTENANCE,
      ],
    }

    const allowedTransitions = validTransitions[currentStatus] || []
    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidApartmentStatusTransitionError(currentStatus, newStatus)
    }
  }

  private async validateApartmentNotOccupied(unitCode: string): Promise<void> {
    const apartment = await this.apartmentRepository.findByUnitCode(unitCode)
    if (apartment && apartment.statusValue === ApartmentStatus.OCCUPIED) {
      throw new ApartmentOccupiedError(unitCode)
    }
  }
}
