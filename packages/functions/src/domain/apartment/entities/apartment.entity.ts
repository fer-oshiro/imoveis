export class Apartment {
  constructor(
    private pk: string,
    private sk: string = `INFO#ACTIVE#${new Date().toISOString()}`,

    private unitCode: string,
    private unitLabel: string,
    private address: string = '',
    private occupancyStatus: string,
    private status: string = 'occupied', // previous values: available, occupied, maintenance
    private rentalSource: string = 'direct', // previous values: direct, imobiliare, airbnb

    private baseRent: string,
    private cleaningFee: string,

    private primaryResident: string,
    private mainTenant: string,
    private cpf: string,

    private hasCleaningService: string,
    private waterIncluded: string,
    private electricityIncluded: string,

    private contactPhone: string,
    private contactMethod: string,

    private updateAt: string,
    private createdAt: string = new Date().toISOString(),
    private endDate: string = '',
  ) {}

  public static create(
    sk: string,
    unitCode: string,
    unitLabel: string,
    address: string,
    occupancyStatus: string,
    status: string,
    rentalSource: string,
    baseRent: string,
    cleaningFee: string,
    primaryResident: string = '',
    mainTenant: string = '',
    cpf: string = '',
    hasCleaningService: string = 'no',
    waterIncluded: string = 'no',
    electricityIncluded: string = 'no',
    contactPhone: string = '',
    contactMethod: string = 'whatsapp',
  ): Apartment {
    return new Apartment(
      `APARTMENT#${unitCode}`,
      sk ?? `INFO#ACTIVE#${new Date().toISOString()}`,
      unitCode,
      unitLabel,
      address,
      occupancyStatus,
      status,
      rentalSource,
      baseRent,
      cleaningFee,
      primaryResident,
      mainTenant,
      cpf,
      hasCleaningService,
      waterIncluded,
      electricityIncluded,
      contactPhone,
      contactMethod,
      new Date().toISOString(),
    )
  }

  inactivate(): void {
    this.status = 'inactive'
    const date = this.sk.split('#')[2]
    this.sk = `INFO#INACTIVE#${date}`
  }

  public toJSON() {
    return {
      pk: this.pk,
      sk: this.sk,
      unitCode: this.unitCode,
      unitLabel: this.unitLabel,
      address: this.address,
      occupancyStatus: this.occupancyStatus,
      status: this.status,
      rentalSource: this.rentalSource,
      baseRent: this.baseRent,
      cleaningFee: this.cleaningFee,
      primaryResident: this.primaryResident,
      mainTenant: this.mainTenant,
      cpf: this.cpf,
      hasCleaningService: this.hasCleaningService,
      waterIncluded: this.waterIncluded,
      electricityIncluded: this.electricityIncluded,
      contactPhone: this.contactPhone,
      contactMethod: this.contactMethod,
      updateAt: this.updateAt,
      createdAt: this.createdAt,
      endDate: this.endDate,
    }
  }
}
