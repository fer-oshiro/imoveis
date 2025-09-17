import { describe, it, expect } from 'vitest';
import { createApartmentDto } from '../../dto/create-apartment.dto';
import { ContactMethod } from '../../../shared';
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo';

describe('CreateApartmentDto', () => {
    const validData = {
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 1500,
        contactPhone: '+5511999999999',
    };

    it('should validate valid apartment data', () => {
        const result = createApartmentDto.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate apartment data with all optional fields', () => {
        const fullData = {
            ...validData,
            status: ApartmentStatus.AVAILABLE,
            rentalType: RentalType.BOTH,
            cleaningFee: 100,
            images: ['image1.jpg', 'image2.jpg'],
            amenities: {
                hasCleaningService: true,
                waterIncluded: true,
                hasWifi: true,
            },
            contactMethod: ContactMethod.WHATSAPP,
            airbnbLink: 'https://airbnb.com/rooms/123',
            isAvailable: true,
            availableFrom: '2024-01-01T00:00:00.000Z',
        };

        const result = createApartmentDto.safeParse(fullData);
        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.availableFrom).toBeInstanceOf(Date);
        }
    });

    it('should reject invalid unit code', () => {
        const invalidData = {
            ...validData,
            unitCode: '',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid unit label', () => {
        const invalidData = {
            ...validData,
            unitLabel: '',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid address', () => {
        const invalidData = {
            ...validData,
            address: '',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject negative base rent', () => {
        const invalidData = {
            ...validData,
            baseRent: -100,
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject negative cleaning fee', () => {
        const invalidData = {
            ...validData,
            cleaningFee: -50,
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid contact phone', () => {
        const invalidData = {
            ...validData,
            contactPhone: '',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid Airbnb URL', () => {
        const invalidData = {
            ...validData,
            airbnbLink: 'not-a-url',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
        const invalidData = {
            ...validData,
            status: 'invalid_status',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject invalid rental type', () => {
        const invalidData = {
            ...validData,
            rentalType: 'invalid_type',
        };

        const result = createApartmentDto.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should transform availableFrom string to Date', () => {
        const dataWithDate = {
            ...validData,
            availableFrom: '2024-01-01T00:00:00.000Z',
        };

        const result = createApartmentDto.safeParse(dataWithDate);
        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.availableFrom).toBeInstanceOf(Date);
            expect(result.data.availableFrom?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        }
    });
});