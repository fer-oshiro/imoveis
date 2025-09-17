import { DomainError, ApartmentAggregationService } from '../../shared'
import { Apartment } from '../entities/apartment.entity'
import ApartmentRepository, { IApartmentRepository } from '../repositories/apartment.repository'
import { CreateApartmentDto, UpdateApartmentDto, ApartmentQueryDto } from '../dto'
import {
  ApartmentWithPaymentInfo,
  ApartmentDetails,
  ApartmentLog,
  ApartmentListing,
} from '../../shared/models/query-result.models'
import { ApartmentStatus, RentalType } from '../vo/apartment-enums.vo'
import { Payment } from '../../payment/entities/payment.entity'
import { User } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'

export default class ApartmentService {
  private apartmentRepository: IApartmentRepository

  constructor(apartmentRepository?: IApartmentRepository) {
    this.apartmentRepository = apartmentRepository || ApartmentRepository.getInstance()
  }

  // Main usage: list apartments with last payment info (admin view)
  async getApartmentsWithLastPayment(
    payments: Payment[] = [],
  ): Promise<ApartmentWithPaymentInfo[]> {
    try {
      const apartments = await this.apartmentRepository.findAll()
      return await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        apartments,
        payments,
      )
    } catch (error) {
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
      // Check if apartment with same unit code already exists
      const existingApartment = await this.apartmentRepository.findByUnitCode(dto.unitCode)
      if (existingApartment) {
        throw new DomainError(
          `Apartment with unit code ${dto.unitCode} already exists`,
          'APARTMENT_ALREADY_EXISTS',
          409,
        )
      }

      const apartment = Apartment.create({
        ...dto,
        status: dto.status as ApartmentStatus,
        rentalType: dto.rentalType as RentalType,
        createdBy,
      })

      return await this.apartmentRepository.save(apartment)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to create apartment', 'APARTMENT_CREATE_ERROR')
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
        throw new DomainError(
          `Apartment with unit code ${unitCode} not found`,
          'APARTMENT_NOT_FOUND',
          404,
        )
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
      throw new DomainError('Failed to update apartment', 'APARTMENT_UPDATE_ERROR')
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
      throw new DomainError('Failed to get apartment', 'APARTMENT_QUERY_ERROR')
    }
  }

  async getApartmentsByStatus(status: ApartmentStatus): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findByStatus(status)
    } catch (error) {
      throw new DomainError('Failed to get apartments by status', 'APARTMENT_QUERY_ERROR')
    }
  }

  async getApartmentsByRentalType(rentalType: RentalType): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findByRentalType(rentalType)
    } catch (error) {
      throw new DomainError('Failed to get apartments by rental type', 'APARTMENT_QUERY_ERROR')
    }
  }

  async queryApartments(query: ApartmentQueryDto): Promise<Apartment[]> {
    try {
      return await this.apartmentRepository.findWithQuery(query)
    } catch (error) {
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
    // This would typically require the relationship service
    // For now, return empty array to maintain compatibility
    return []
  }

  async getApartmentContracts(unitCode: string) {
    // This would typically require the contract service
    // For now, return empty array to maintain compatibility
    return []
  }

  async getApartmentPayments(unitCode: string) {
    // This would typically require the payment service
    // For now, return empty array to maintain compatibility
    return []
  }
}
