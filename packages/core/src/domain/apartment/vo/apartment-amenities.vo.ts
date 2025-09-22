export interface ApartmentAmenities {
  hasCleaningService: boolean
  waterIncluded: boolean
  electricityIncluded: boolean
  hasWifi: boolean
  hasAirConditioning: boolean
  hasWashingMachine: boolean
  hasFurniture: boolean
  hasParking: boolean
}

export class ApartmentAmenitiesVO implements ApartmentAmenities {
  public readonly hasCleaningService: boolean
  public readonly waterIncluded: boolean
  public readonly electricityIncluded: boolean
  public readonly hasWifi: boolean
  public readonly hasAirConditioning: boolean
  public readonly hasWashingMachine: boolean
  public readonly hasFurniture: boolean
  public readonly hasParking: boolean

  constructor(data: Partial<ApartmentAmenities> = {}) {
    this.hasCleaningService = data.hasCleaningService ?? false
    this.waterIncluded = data.waterIncluded ?? false
    this.electricityIncluded = data.electricityIncluded ?? false
    this.hasWifi = data.hasWifi ?? false
    this.hasAirConditioning = data.hasAirConditioning ?? false
    this.hasWashingMachine = data.hasWashingMachine ?? false
    this.hasFurniture = data.hasFurniture ?? false
    this.hasParking = data.hasParking ?? false
  }

  static create(data: Partial<ApartmentAmenities> = {}): ApartmentAmenitiesVO {
    return new ApartmentAmenitiesVO(data)
  }

  toJSON(): Record<string, any> {
    return {
      hasCleaningService: this.hasCleaningService,
      waterIncluded: this.waterIncluded,
      electricityIncluded: this.electricityIncluded,
      hasWifi: this.hasWifi,
      hasAirConditioning: this.hasAirConditioning,
      hasWashingMachine: this.hasWashingMachine,
      hasFurniture: this.hasFurniture,
      hasParking: this.hasParking,
    }
  }

  static fromJSON(data: Record<string, any>): ApartmentAmenitiesVO {
    return new ApartmentAmenitiesVO(data)
  }
}
