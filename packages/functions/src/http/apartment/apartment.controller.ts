import ApartmentService from '../../domain/apartment/services/apartment.service'
import {
  CreateApartmentDto,
  UpdateApartmentDto,
  ApartmentQueryDto,
} from '../../domain/apartment/dto'
import { ApartmentStatus, RentalType } from '../../domain/apartment/vo/apartment-enums.vo'
import { DomainError } from '../../domain/shared/errors/domain-error'

export class ApartmentController {
  private apartmentService: ApartmentService

  constructor() {
    this.apartmentService = new ApartmentService()
  }

  // Main admin view: apartments with last payment info
  async getApartmentsWithLastPayment() {
    try {
      return await this.apartmentService.getApartmentsWithLastPayment()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartments with payment info', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Landing page: available apartments for long-term rental
  async getAvailableApartments() {
    try {
      return await this.apartmentService.getAvailableApartments()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get available apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Landing page: Airbnb apartments
  async getAirbnbApartments() {
    try {
      return await this.apartmentService.getAirbnbApartments()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get Airbnb apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Apartment details with users and contracts
  async getApartmentDetails(unitCode: string) {
    try {
      return await this.apartmentService.getApartmentDetails(unitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartment details', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Apartment log with history
  async getApartmentLog(unitCode: string) {
    try {
      return await this.apartmentService.getApartmentLog(unitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartment log', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Get single apartment by unit code
  async getApartmentByUnitCode(unitCode: string) {
    try {
      const apartment = await this.apartmentService.getApartmentByUnitCode(unitCode)
      if (!apartment) {
        throw new DomainError(
          `Apartment with unit code ${unitCode} not found`,
          'APARTMENT_NOT_FOUND',
          404,
        )
      }
      return apartment
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartment', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Get apartments by status
  async getApartmentsByStatus(status: ApartmentStatus) {
    try {
      return await this.apartmentService.getApartmentsByStatus(status)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartments by status', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Get apartments by rental type
  async getApartmentsByRentalType(rentalType: RentalType) {
    try {
      return await this.apartmentService.getApartmentsByRentalType(rentalType)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartments by rental type', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Query apartments with filters
  async queryApartments(query: ApartmentQueryDto) {
    try {
      return await this.apartmentService.queryApartments(query)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to query apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  // Create new apartment
  async createApartment(dto: CreateApartmentDto, createdBy?: string) {
    try {
      return await this.apartmentService.createApartment(dto, createdBy)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to create apartment', 'APARTMENT_CREATE_ERROR')
    }
  }

  // Update apartment
  async updateApartment(unitCode: string, dto: UpdateApartmentDto, updatedBy?: string) {
    try {
      return await this.apartmentService.updateApartment(unitCode, dto, updatedBy)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to update apartment', 'APARTMENT_UPDATE_ERROR')
    }
  }

  // Deactivate apartment
  async deactivateApartment(unitCode: string, updatedBy?: string) {
    try {
      await this.apartmentService.deactivateApartment(unitCode, updatedBy)
      return { message: 'Apartment deactivated successfully' }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to deactivate apartment', 'APARTMENT_UPDATE_ERROR')
    }
  }

  // Legacy methods for backward compatibility
  async getApartments() {
    try {
      return await this.apartmentService.getApartments()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get apartments', 'APARTMENT_QUERY_ERROR')
    }
  }

  async getApartmentById(id: string) {
    // Legacy method - redirect to getApartmentByUnitCode
    return this.getApartmentByUnitCode(id)
  }
}
