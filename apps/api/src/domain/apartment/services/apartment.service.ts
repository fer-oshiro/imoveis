import { ApartmentRepository } from '@imovel/core/ports'

export default class ApartmentService {
  private apartmentRepository: ApartmentRepository

  constructor(apartmentRepository: ApartmentRepository) {
    this.apartmentRepository = apartmentRepository
  }

  public async getApartmentsWithLastPayment() {
    return this.apartmentRepository.findAll()
  }
}
