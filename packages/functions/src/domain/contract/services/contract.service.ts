import { Contract } from '../entities/contract.entity'
import { IContractRepository } from '../repositories/contract.repository'
import { ContractStatus } from '../vo/contract-enums.vo'
import { ContractTerms } from '../vo/contract-terms.vo'
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
import { BusinessRuleViolationError } from '../../shared'
import {
  ContractAlreadyExistsError,
  InvalidContractDateError,
  ContractDateOverlapError,
  ContractAlreadyTerminatedError,
  ContractNotActiveError,
  ContractRenewalError,
  ContractCreateError,
} from '../errors'

export class ContractService {
  constructor(private readonly contractRepository: IContractRepository) {}

  async createContract(dto: CreateContractDto): Promise<ContractResponseDto> {
    try {
      // Validate input
      CreateContractDtoValidator.validate(dto)
      const sanitizedDto = CreateContractDtoValidator.sanitize(dto)

      // Business rule validations
      await this.validateNoActiveContract(sanitizedDto.apartmentUnitCode)
      this.validateContractDates(new Date(sanitizedDto.startDate), new Date(sanitizedDto.endDate))
      this.validateContractTerms(sanitizedDto.terms)
      await this.validateNoDateOverlap(
        sanitizedDto.apartmentUnitCode,
        new Date(sanitizedDto.startDate),
        new Date(sanitizedDto.endDate),
      )

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
    } catch (error) {
      if (error instanceof BusinessRuleViolationError) {
        throw error
      }
      throw new ContractCreateError('Failed to create contract', error as Error)
    }
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

  // Business rule validation methods
  private async validateNoActiveContract(apartmentUnitCode: string): Promise<void> {
    const existingActiveContract =
      await this.contractRepository.findActiveByApartment(apartmentUnitCode)
    if (existingActiveContract) {
      throw new ContractAlreadyExistsError(apartmentUnitCode)
    }
  }

  private validateContractDates(startDate: Date, endDate: Date): void {
    const now = new Date()

    // Start date cannot be more than 1 year in the past
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    if (startDate < oneYearAgo) {
      throw new InvalidContractDateError(
        'Contract start date cannot be more than 1 year in the past',
      )
    }

    // End date must be after start date
    if (endDate <= startDate) {
      throw new InvalidContractDateError('Contract end date must be after start date')
    }

    // Contract duration should be reasonable (minimum 1 month, maximum 5 years)
    const durationInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

    if (durationInDays < 30) {
      throw new InvalidContractDateError('Contract duration must be at least 30 days')
    }

    if (durationInDays > 1825) {
      // 5 years
      throw new InvalidContractDateError('Contract duration cannot exceed 5 years')
    }
  }

  private validateContractTerms(terms: ContractTerms): void {
    if (!terms.monthlyRent || terms.monthlyRent <= 0) {
      throw new BusinessRuleViolationError('Monthly rent must be greater than zero')
    }

    if (terms.monthlyRent < 500) {
      throw new BusinessRuleViolationError('Monthly rent is too low (minimum R$500)')
    }

    if (terms.monthlyRent > 10000) {
      throw new BusinessRuleViolationError('Monthly rent is too high (maximum R$10,000)')
    }

    if (terms.paymentDueDay < 1 || terms.paymentDueDay > 31) {
      throw new BusinessRuleViolationError('Payment due day must be between 1 and 31')
    }

    if (terms.securityDeposit && terms.securityDeposit < 0) {
      throw new BusinessRuleViolationError('Security deposit cannot be negative')
    }

    if (terms.securityDeposit && terms.securityDeposit > terms.monthlyRent * 3) {
      throw new BusinessRuleViolationError('Security deposit cannot exceed 3 months of rent')
    }
  }

  private async validateNoDateOverlap(
    apartmentUnitCode: string,
    startDate: Date,
    endDate: Date,
    excludeContractId?: string,
  ): Promise<void> {
    const existingContracts = await this.contractRepository.findByApartment(apartmentUnitCode)

    for (const contract of existingContracts) {
      // Skip the contract being updated
      if (excludeContractId && contract.contractIdValue === excludeContractId) {
        continue
      }

      // Skip terminated contracts
      if (contract.statusValue === ContractStatus.TERMINATED) {
        continue
      }

      const contractStart = contract.startDateValue
      const contractEnd = contract.endDateValue

      // Check for overlap
      if (
        (startDate >= contractStart && startDate < contractEnd) ||
        (endDate > contractStart && endDate <= contractEnd) ||
        (startDate <= contractStart && endDate >= contractEnd)
      ) {
        throw new ContractDateOverlapError(apartmentUnitCode, startDate, endDate)
      }
    }
  }

  private validateContractCanBeTerminated(contract: Contract): void {
    if (contract.statusValue === ContractStatus.TERMINATED) {
      throw new ContractAlreadyTerminatedError(contract.contractIdValue)
    }

    if (contract.statusValue !== ContractStatus.ACTIVE) {
      throw new ContractNotActiveError(contract.contractIdValue)
    }
  }

  private validateContractCanBeRenewed(contract: Contract): void {
    if (contract.statusValue === ContractStatus.TERMINATED) {
      throw new ContractRenewalError(contract.contractIdValue, 'Contract is terminated')
    }

    if (
      contract.statusValue !== ContractStatus.ACTIVE &&
      contract.statusValue !== ContractStatus.EXPIRED
    ) {
      throw new ContractRenewalError(
        contract.contractIdValue,
        'Only active or expired contracts can be renewed',
      )
    }
  }
}
