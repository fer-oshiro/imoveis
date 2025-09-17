import ApartmentService from '../../domain/apartment/services/apartment.service'
import {
  ApartmentQueryDto,
  createApartmentDto,
  updateApartmentDto,
} from '../../domain/apartment/dto'
import { ApartmentStatus, RentalType } from '../../domain/apartment/vo/apartment-enums.vo'
import { BaseController, safeParseWithValidationError } from '../../domain/shared'
import { ApartmentNotFoundError } from '../../domain/apartment/errors'

export class ApartmentController extends BaseController {
  private apartmentService: ApartmentService

  constructor() {
    super()
    this.apartmentService = new ApartmentService()
  }

  // Main admin view: apartments with last payment info
  async getApartmentsWithLastPayment() {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentsWithLastPayment(),
      'get apartments with payment info',
    )
  }

  // Landing page: available apartments for long-term rental
  async getAvailableApartments() {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getAvailableApartments(),
      'get available apartments',
    )
  }

  // Landing page: Airbnb apartments
  async getAirbnbApartments() {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getAirbnbApartments(),
      'get Airbnb apartments',
    )
  }

  // Apartment details with users and contracts
  async getApartmentDetails(unitCode: string) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentDetails(unitCode),
      'get apartment details',
    )
  }

  // Apartment log with history
  async getApartmentLog(unitCode: string) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentLog(unitCode),
      'get apartment log',
    )
  }

  // Get single apartment by unit code
  async getApartmentByUnitCode(unitCode: string) {
    return this.executeWithErrorHandling(async () => {
      const apartment = await this.apartmentService.getApartmentByUnitCode(unitCode)
      if (!apartment) {
        throw new ApartmentNotFoundError(unitCode)
      }
      return apartment
    }, 'get apartment by unit code')
  }

  // Get apartments by status
  async getApartmentsByStatus(status: ApartmentStatus) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentsByStatus(status),
      'get apartments by status',
    )
  }

  // Get apartments by rental type
  async getApartmentsByRentalType(rentalType: RentalType) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentsByRentalType(rentalType),
      'get apartments by rental type',
    )
  }

  // Query apartments with filters
  async queryApartments(query: ApartmentQueryDto) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.queryApartments(query),
      'query apartments',
    )
  }

  // Create new apartment
  async createApartment(data: unknown, createdBy?: string) {
    return this.executeWithValidation(
      data,
      (data) => createApartmentDto.parse(data),
      (validatedDto) => this.apartmentService.createApartment(validatedDto, createdBy),
      'create apartment',
    )
  }

  // Update apartment
  async updateApartment(unitCode: string, data: unknown, updatedBy?: string) {
    return this.executeWithValidation(
      data,
      (data) => updateApartmentDto.parse(data),
      (validatedDto) => this.apartmentService.updateApartment(unitCode, validatedDto, updatedBy),
      'update apartment',
    )
  }

  // Deactivate apartment
  async deactivateApartment(unitCode: string, updatedBy?: string) {
    return this.executeWithErrorHandling(async () => {
      await this.apartmentService.deactivateApartment(unitCode, updatedBy)
      return { message: 'Apartment deactivated successfully' }
    }, 'deactivate apartment')
  }

  // Legacy methods for backward compatibility
  async getApartments() {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartments(),
      'get apartments',
    )
  }

  async getApartmentById(id: string) {
    // Legacy method - redirect to getApartmentByUnitCode
    return this.getApartmentByUnitCode(id)
  }

  // Get apartment users (relationships)
  async getApartmentUsers(unitCode: string) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentUsers(unitCode),
      'get apartment users',
    )
  }

  // Get apartment contracts
  async getApartmentContracts(unitCode: string) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentContracts(unitCode),
      'get apartment contracts',
    )
  }

  // Get apartment payments
  async getApartmentPayments(unitCode: string) {
    return this.executeWithErrorHandling(
      () => this.apartmentService.getApartmentPayments(unitCode),
      'get apartment payments',
    )
  }
}
