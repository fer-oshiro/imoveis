import { describe, it, expect } from 'vitest'
import { Apartment } from '../../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'
import { ContactMethod } from '../../../shared'

describe('Apartment Entity', () => {
  const mockApartmentData = {
    unitCode: 'A101',
    unitLabel: 'Apartment 101',
    address: '123 Main St',
    baseRent: 1500,
    contactPhone: '+5511999999999',
  }

  it('should create an apartment with default values', () => {
    const apartment = Apartment.create(mockApartmentData)

    expect(apartment.unitCodeValue).toBe('A101')
    expect(apartment.unitLabelValue).toBe('Apartment 101')
    expect(apartment.addressValue).toBe('123 Main St')
    expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
    expect(apartment.rentalTypeValue).toBe(RentalType.LONG_TERM)
    expect(apartment.baseRentValue).toBe(1500)
    expect(apartment.cleaningFeeValue).toBe(0)
    expect(apartment.isAvailableValue).toBe(false)
  })

  it('should create an apartment with custom values', () => {
    const apartment = Apartment.create({
      ...mockApartmentData,
      status: ApartmentStatus.OCCUPIED,
      rentalType: RentalType.AIRBNB,
      cleaningFee: 100,
      isAvailable: true,
      airbnbLink: 'https://airbnb.com/rooms/123',
    })

    expect(apartment.statusValue).toBe(ApartmentStatus.OCCUPIED)
    expect(apartment.rentalTypeValue).toBe(RentalType.AIRBNB)
    expect(apartment.cleaningFeeValue).toBe(100)
    expect(apartment.isAvailableValue).toBe(true)
    expect(apartment.airbnbLinkValue).toBe('https://airbnb.com/rooms/123')
  })

  it('should mark apartment as occupied', () => {
    const apartment = Apartment.create({
      ...mockApartmentData,
      status: ApartmentStatus.AVAILABLE,
      isAvailable: true,
    })

    apartment.markAsOccupied('admin')

    expect(apartment.statusValue).toBe(ApartmentStatus.OCCUPIED)
    expect(apartment.isAvailableValue).toBe(false)
    expect(apartment.availableFromValue).toBeUndefined()
  })

  it('should mark apartment as available', () => {
    const apartment = Apartment.create({
      ...mockApartmentData,
      status: ApartmentStatus.OCCUPIED,
    })

    const availableDate = new Date('2024-01-01')
    apartment.markAsAvailable(availableDate, 'admin')

    expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
    expect(apartment.isAvailableValue).toBe(true)
    expect(apartment.availableFromValue).toBe(availableDate)
  })

  it('should check if Airbnb is enabled', () => {
    const airbnbApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.AIRBNB,
    })

    const bothApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.BOTH,
    })

    const longTermApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.LONG_TERM,
    })

    expect(airbnbApartment.isAirbnbEnabled()).toBe(true)
    expect(bothApartment.isAirbnbEnabled()).toBe(true)
    expect(longTermApartment.isAirbnbEnabled()).toBe(false)
  })

  it('should check if long term is enabled', () => {
    const airbnbApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.AIRBNB,
    })

    const bothApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.BOTH,
    })

    const longTermApartment = Apartment.create({
      ...mockApartmentData,
      rentalType: RentalType.LONG_TERM,
    })

    expect(airbnbApartment.isLongTermEnabled()).toBe(false)
    expect(bothApartment.isLongTermEnabled()).toBe(true)
    expect(longTermApartment.isLongTermEnabled()).toBe(true)
  })

  it('should serialize to JSON correctly', () => {
    const apartment = Apartment.create(mockApartmentData)
    const json = apartment.toJSON()

    expect(json.pk).toBe('APARTMENT#A101')
    expect(json.sk).toBe('INFO')
    expect(json.unitCode).toBe('A101')
    expect(json.unitLabel).toBe('Apartment 101')
    expect(json.address).toBe('123 Main St')
    expect(json.status).toBe(ApartmentStatus.AVAILABLE)
    expect(json.rentalType).toBe(RentalType.LONG_TERM)
    expect(json.baseRent).toBe(1500)
    expect(json.cleaningFee).toBe(0)
    expect(json.isAvailable).toBe(false)
    expect(json.contactInfo).toBeDefined()
    expect(json.amenities).toBeDefined()
    expect(json.createdAt).toBeDefined()
    expect(json.updatedAt).toBeDefined()
  })

  it('should deserialize from JSON correctly', () => {
    const apartment = Apartment.create(mockApartmentData)
    const json = apartment.toJSON()
    const deserialized = Apartment.fromJSON(json)

    expect(deserialized.unitCodeValue).toBe(apartment.unitCodeValue)
    expect(deserialized.unitLabelValue).toBe(apartment.unitLabelValue)
    expect(deserialized.addressValue).toBe(apartment.addressValue)
    expect(deserialized.statusValue).toBe(apartment.statusValue)
    expect(deserialized.rentalTypeValue).toBe(apartment.rentalTypeValue)
    expect(deserialized.baseRentValue).toBe(apartment.baseRentValue)
    expect(deserialized.cleaningFeeValue).toBe(apartment.cleaningFeeValue)
  })
})
