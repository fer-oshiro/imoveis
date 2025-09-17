import { Contract } from '../entities/contract.entity'
import { IContractRepository } from '../repositories/contract.repository'
import { ContractStatus } from '../vo/contract-enums.vo'
import { ContractTerms, ContractTermsVO } from '../vo/contract-terms.vo'
import {
  CreateContractDto,
  CreateContractDtoValidator,
  UpdateContractDto,
  UpdateContractDtoValidator,
  RenewContractDto,
  RenewContractDtoValidator,
  ContractResponseDto,
  ContractResponseDtoMapper,
} from '../dto'

export class ContractService {
  constructor(private readonly contractRepository: IContractRepository) {}

  async createContract(dto: CreateContractDto): Promise<ContractResponseDto> {
    // Validate input
    CreateContractDtoValidator.validate(dto)
    const sanitizedDto = CreateContractDtoValidator.sanitize(dto)

    // Check if there's already an active contract for this apartment
    const existingActiveContract = await this.contractRepository.findActiveByApartment(
      sanitizedDto.apartmentUnitCode,
    )

    if (existingActiveContract) {
      throw new Error(`Apartment ${sanitizedDto.apartmentUnitCode} already has an active contract`)
    }

    // Generate contract ID
    const contractId = this.generateContractId(sanitizedDto.apartmentUnitCode)

    // Create contract entity
    const contract = Contract.create({
      contractId,
      apartmentUnitCode: sanitizedDto.apartmentUnitCode,
      tenantPhoneNumber: sanitizedDto.tenantPhoneNumber,
      startDate: new Date(sanitizedDto.startDate),
      endDate: new Date(sanitizedDto.endDate),
      terms: sanitizedDto.terms,
      status: sanitizedDto.status,
      createdBy: sanitizedDto.createdBy,
    })

    // Save to repository
    const savedContract = await this.contractRepository.save(contract)

    return ContractResponseDtoMapper.fromEntity(savedContract)
  }

  async getActiveContractByApartment(unitCode: string): Promise<ContractResponseDto | null> {
    const contract = await this.contractRepository.findActiveByApartment(unitCode)
    return contract ? ContractResponseDtoMapper.fromEntity(contract) : null
  }

  async getContractsByApartment(unitCode: string): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findByApartment(unitCode)
    return ContractResponseDtoMapper.fromEntities(contracts)
  }

  async getContractsByTenant(phoneNumber: string): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findByTenant(phoneNumber)
    return ContractResponseDtoMapper.fromEntities(contracts)
  }

  async getContractById(contractId: string): Promise<ContractResponseDto | null> {
    const contract = await this.contractRepository.findById(contractId)
    return contract ? ContractResponseDtoMapper.fromEntity(contract) : null
  }

  async updateContract(contractId: string, dto: UpdateContractDto): Promise<ContractResponseDto> {
    // Validate input
    UpdateContractDtoValidator.validate(dto)
    const sanitizedDto = UpdateContractDtoValidator.sanitize(dto)

    // Find existing contract
    const existingContract = await this.contractRepository.findById(contractId)
    if (!existingContract) {
      throw new Error(`Contract with ID ${contractId} not found`)
    }

    // Apply updates
    if (sanitizedDto.endDate) {
      existingContract.extend(new Date(sanitizedDto.endDate), sanitizedDto.updatedBy)
    }

    if (sanitizedDto.terms) {
      const currentTerms = existingContract.termsValue.toJSON()
      const updatedTerms = { ...currentTerms, ...sanitizedDto.terms } as ContractTerms
      existingContract.updateTerms(updatedTerms, sanitizedDto.updatedBy)
    }

    if (sanitizedDto.status) {
      switch (sanitizedDto.status) {
        case ContractStatus.ACTIVE:
          existingContract.activate(sanitizedDto.updatedBy)
          break
        case ContractStatus.TERMINATED:
          existingContract.terminate(sanitizedDto.updatedBy)
          break
        case ContractStatus.EXPIRED:
          existingContract.expire(sanitizedDto.updatedBy)
          break
      }
    }

    // Save updated contract
    const updatedContract = await this.contractRepository.save(existingContract)

    return ContractResponseDtoMapper.fromEntity(updatedContract)
  }

  async terminateContract(contractId: string, updatedBy?: string): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findById(contractId)
    if (!contract) {
      throw new Error(`Contract with ID ${contractId} not found`)
    }

    contract.terminate(updatedBy)
    const updatedContract = await this.contractRepository.save(contract)

    return ContractResponseDtoMapper.fromEntity(updatedContract)
  }

  async renewContract(contractId: string, dto: RenewContractDto): Promise<ContractResponseDto> {
    // Validate input
    RenewContractDtoValidator.validate(dto)
    const sanitizedDto = RenewContractDtoValidator.sanitize(dto)

    // Find existing contract
    const existingContract = await this.contractRepository.findById(contractId)
    if (!existingContract) {
      throw new Error(`Contract with ID ${contractId} not found`)
    }

    if (!existingContract.isActive() && !existingContract.isExpired()) {
      throw new Error('Only active or expired contracts can be renewed')
    }

    // Extend the contract
    existingContract.extend(new Date(sanitizedDto.newEndDate), sanitizedDto.updatedBy)

    // Update terms if provided
    if (sanitizedDto.newTerms) {
      const currentTerms = existingContract.termsValue.toJSON()
      const updatedTerms = { ...currentTerms, ...sanitizedDto.newTerms } as ContractTerms
      existingContract.updateTerms(updatedTerms, sanitizedDto.updatedBy)
    }

    // Activate if it was expired
    if (existingContract.isExpired()) {
      existingContract.activate(sanitizedDto.updatedBy)
    }

    // Save renewed contract
    const renewedContract = await this.contractRepository.save(existingContract)

    return ContractResponseDtoMapper.fromEntity(renewedContract)
  }

  async getExpiringContracts(daysFromNow: number = 30): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findExpiring(daysFromNow)
    return ContractResponseDtoMapper.fromEntities(contracts)
  }

  async getContractsByStatus(status: ContractStatus): Promise<ContractResponseDto[]> {
    const contracts = await this.contractRepository.findByStatus(status)
    return ContractResponseDtoMapper.fromEntities(contracts)
  }

  async deleteContract(contractId: string): Promise<void> {
    const contract = await this.contractRepository.findById(contractId)
    if (!contract) {
      throw new Error(`Contract with ID ${contractId} not found`)
    }

    if (contract.isActive()) {
      throw new Error('Cannot delete an active contract. Terminate it first.')
    }

    await this.contractRepository.delete(contractId)
  }

  private generateContractId(apartmentUnitCode: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${apartmentUnitCode}-${timestamp}-${random}`.toUpperCase()
  }
}
