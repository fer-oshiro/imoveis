import { ApartmentRepository, ContractRepository, UserRepository } from '@imovel/core/ports'

import { ApartmentService } from '../../domain/apartment'
import { BaseController } from '../../domain/shared'

export class ApartmentController extends BaseController {
  private apartmentService: ApartmentService

  constructor(
    apartmentRepository: ApartmentRepository,
    contractRepository: ContractRepository,
    userRepository: UserRepository,
  ) {
    super()
    this.apartmentService = new ApartmentService(
      apartmentRepository,
      contractRepository,
      userRepository,
    )
  }

  public async getApartmentsWithLastPayment() {
    const apartmentsWithPayment = await this.apartmentService.getApartmentsWithLastPayment()
    return {
      status: 'success',
      data: apartmentsWithPayment.map((apWithPayment) => ({
        apartment: apWithPayment.apartment.toJSON(),
        contract: apWithPayment.contract[0]?.toJSON(),
        user: apWithPayment.user[0],
      })),
    }
  }

  public async getAllApartments() {
    const apartments = await this.apartmentService.getAllApartments()
    return {
      status: 'success',
      data: apartments,
    }
  }
}
