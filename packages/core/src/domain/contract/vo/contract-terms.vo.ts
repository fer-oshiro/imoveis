export interface ContractTerms {
  monthlyRent: number
  paymentDueDay: number
  securityDeposit?: number
  utilitiesIncluded: boolean
  cleaningServiceIncluded: boolean
  internetIncluded: boolean
  additionalTerms?: string
  renewalTerms?: string
}

export class ContractTermsVO implements ContractTerms {
  public readonly monthlyRent: number
  public readonly paymentDueDay: number
  public readonly securityDeposit?: number
  public readonly utilitiesIncluded: boolean
  public readonly cleaningServiceIncluded: boolean
  public readonly internetIncluded: boolean
  public readonly additionalTerms?: string
  public readonly renewalTerms?: string

  constructor(data: ContractTerms) {
    this.monthlyRent = data.monthlyRent
    this.paymentDueDay = data.paymentDueDay
    this.securityDeposit = data.securityDeposit
    this.utilitiesIncluded = data.utilitiesIncluded
    this.cleaningServiceIncluded = data.cleaningServiceIncluded
    this.internetIncluded = data.internetIncluded
    this.additionalTerms = data.additionalTerms
    this.renewalTerms = data.renewalTerms

    this.validate()
  }

  private validate(): void {
    if (this.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than 0')
    }
    if (this.paymentDueDay < 1 || this.paymentDueDay > 31) {
      throw new Error('Payment due day must be between 1 and 31')
    }
    if (this.securityDeposit !== undefined && this.securityDeposit < 0) {
      throw new Error('Security deposit cannot be negative')
    }
  }

  static create(data: ContractTerms): ContractTermsVO {
    return new ContractTermsVO(data)
  }

  toJSON(): Record<string, any> {
    return {
      monthlyRent: this.monthlyRent,
      paymentDueDay: this.paymentDueDay,
      securityDeposit: this.securityDeposit,
      utilitiesIncluded: this.utilitiesIncluded,
      cleaningServiceIncluded: this.cleaningServiceIncluded,
      internetIncluded: this.internetIncluded,
      additionalTerms: this.additionalTerms,
      renewalTerms: this.renewalTerms,
    }
  }

  static fromJSON(data: Record<string, any>): ContractTermsVO {
    return new ContractTermsVO({
      monthlyRent: Number(data.monthlyRent) || 0,
      paymentDueDay: Number(data.paymentDueDay) || 1,
      securityDeposit: data.securityDeposit ? Number(data.securityDeposit) : undefined,
      utilitiesIncluded: Boolean(data.utilitiesIncluded),
      cleaningServiceIncluded: Boolean(data.cleaningServiceIncluded),
      internetIncluded: Boolean(data.internetIncluded),
      additionalTerms: data.additionalTerms,
      renewalTerms: data.renewalTerms,
    })
  }
}
