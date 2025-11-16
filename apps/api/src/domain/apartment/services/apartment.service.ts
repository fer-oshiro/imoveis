import { ApartmentRepository, ContractRepository, UserRepository } from '@imovel/core/ports'

export default class ApartmentService {
  constructor(
    private apartmentRepository: ApartmentRepository,
    private contractRepository: ContractRepository,
    private userRepository: UserRepository,
  ) {}

  public async getApartmentsWithLastPayment() {
    const apartments = await this.apartmentRepository.findAll()
    const contracts = await this.contractRepository.findActiveContracts()
    const users = await this.userRepository.findManyByIds(contracts.map((c) => c.userId))

    return apartments
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((apartment) => {
        const apartmentContracts = contracts.filter(
          (contract) => contract.apartmentId === apartment.id,
        )
        const apartmentUsers = users.filter((user) =>
          apartmentContracts.some((contract) => contract.userId === user.id),
        )

        return {
          apartment,
          contract: apartmentContracts,
          user: apartmentUsers,
        }
      })
  }

  public async getAllApartments() {
    const apartments = await this.apartmentRepository.findAll()

    return apartments
  }
}
