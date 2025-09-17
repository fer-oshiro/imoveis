import { describe, it, expect } from 'vitest';
import { ApartmentAmenitiesVO } from '../../vo/apartment-amenities.vo';

describe('ApartmentAmenitiesVO', () => {
    it('should create amenities with default values', () => {
        const amenities = new ApartmentAmenitiesVO();

        expect(amenities.hasCleaningService).toBe(false);
        expect(amenities.waterIncluded).toBe(false);
        expect(amenities.electricityIncluded).toBe(false);
        expect(amenities.hasWifi).toBe(false);
        expect(amenities.hasAirConditioning).toBe(false);
        expect(amenities.hasWashingMachine).toBe(false);
        expect(amenities.hasKitchen).toBe(true); // Default to true
        expect(amenities.hasFurniture).toBe(false);
        expect(amenities.hasParking).toBe(false);
        expect(amenities.hasElevator).toBe(false);
        expect(amenities.hasBalcony).toBe(false);
        expect(amenities.petFriendly).toBe(false);
    });

    it('should create amenities with custom values', () => {
        const amenities = new ApartmentAmenitiesVO({
            hasCleaningService: true,
            waterIncluded: true,
            hasWifi: true,
            hasParking: true,
            petFriendly: true,
        });

        expect(amenities.hasCleaningService).toBe(true);
        expect(amenities.waterIncluded).toBe(true);
        expect(amenities.hasWifi).toBe(true);
        expect(amenities.hasParking).toBe(true);
        expect(amenities.petFriendly).toBe(true);
        expect(amenities.hasKitchen).toBe(true); // Still default to true
    });

    it('should serialize to JSON correctly', () => {
        const amenities = new ApartmentAmenitiesVO({
            hasCleaningService: true,
            waterIncluded: true,
        });

        const json = amenities.toJSON();

        expect(json.hasCleaningService).toBe(true);
        expect(json.waterIncluded).toBe(true);
        expect(json.electricityIncluded).toBe(false);
        expect(json.hasKitchen).toBe(true);
    });

    it('should deserialize from JSON correctly', () => {
        const data = {
            hasCleaningService: true,
            waterIncluded: true,
            hasWifi: true,
            hasParking: false,
        };

        const amenities = ApartmentAmenitiesVO.fromJSON(data);

        expect(amenities.hasCleaningService).toBe(true);
        expect(amenities.waterIncluded).toBe(true);
        expect(amenities.hasWifi).toBe(true);
        expect(amenities.hasParking).toBe(false);
        expect(amenities.hasKitchen).toBe(true); // Default value
    });

    it('should create using static create method', () => {
        const amenities = ApartmentAmenitiesVO.create({
            hasCleaningService: true,
            petFriendly: true,
        });

        expect(amenities.hasCleaningService).toBe(true);
        expect(amenities.petFriendly).toBe(true);
        expect(amenities.hasKitchen).toBe(true);
    });
});