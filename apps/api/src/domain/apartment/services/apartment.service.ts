import { ApartmentRepository } from '@imovel/core/ports'

export default class ApartmentService {
  private apartmentRepository: ApartmentRepository

  constructor(apartmentRepository: ApartmentRepository) {
    this.apartmentRepository = apartmentRepository
  }

  public async getApartmentsWithLastPayment() {
    const apartments = await this.apartmentRepository.findAll()
    
    return apartments
  }

  public async getAllApartments() {
    return this.apartmentRepository.findById('12')
  }
}
