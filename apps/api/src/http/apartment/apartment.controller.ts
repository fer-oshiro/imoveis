import { ApartmentRepository } from '@imovel/core/ports'

import { ApartmentService } from '../../domain/apartment'
import { BaseController } from '../../domain/shared'

export class ApartmentController extends BaseController {
  private apartmentService: ApartmentService

  constructor(apartmentRepository: ApartmentRepository) {
    super()
    this.apartmentService = new ApartmentService(apartmentRepository)
  }

  public async getApartmentsWithLastPayment() {
    const apartments = await this.apartmentService.getApartmentsWithLastPayment()
    return {
      status: 'success',
      data: apartments,
    }
  }
}
