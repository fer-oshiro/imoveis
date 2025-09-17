import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
    validatePhoneNumber,
    validateDocument,
    validateEmail,
    validateName,
    detectDocumentType,
    safeParseWithValidationError,
    phoneNumberValidator,
    documentValidator,
    cpfValidator,
    cnpjValidator,
} from '../../utils/validation.utils';
import { DocumentType } from '../../../shared';
import { ValidationError } from '../../../shared/errors/domain-error';

describe('Validation Utils', () => {
    describe('validatePhoneNumber', () => {
        it('should validate correct phone number', () => {
            const result = validatePhoneNumber('+5511987654321');
            expect(result.value).toBe('+5511987654321');
        });

        it('should throw error for invalid phone number', () => {
            expect(() => validatePhoneNumber('invalid')).toThrow(ValidationError);
        });
    });

    describe('validateDocument', () => {
        it('should validate CPF document', () => {
            const result = validateDocument('11144477735');
            expect(result.type).toBe(DocumentType.CPF);
            expect(result.isCPF).toBe(true);
        });

        it('should validate CNPJ document', () => {
            const result = validateDocument('11222333000181');
            expect(result.type).toBe(DocumentType.CNPJ);
            expect(result.isCNPJ).toBe(true);
        });

        it('should handle empty document', () => {
            const result = validateDocument();
            expect(result.type).toBe(DocumentType.NONE);
            expect(result.hasDocument).toBe(false);
        });

        it('should throw error for invalid document', () => {
            expect(() => validateDocument('invalid')).toThrow(ValidationError);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
        });

        it('should validate undefined email', () => {
            expect(validateEmail()).toBe(true);
        });

        it('should reject invalid email', () => {
            expect(validateEmail('invalid-email')).toBe(false);
        });
    });

    describe('validateName', () => {
        it('should validate correct name', () => {
            expect(() => validateName('João Silva')).not.toThrow();
        });

        it('should throw error for empty name', () => {
            expect(() => validateName('')).toThrow(ValidationError);
        });

        it('should throw error for short name', () => {
            expect(() => validateName('A')).toThrow(ValidationError);
        });
    });

    describe('detectDocumentType', () => {
        it('should detect CPF', () => {
            expect(detectDocumentType('11144477735')).toBe(DocumentType.CPF);
        });

        it('should detect CNPJ', () => {
            expect(detectDocumentType('11222333000181')).toBe(DocumentType.CNPJ);
        });

        it('should throw error for invalid length', () => {
            expect(() => detectDocumentType('123')).toThrow(ValidationError);
        });
    });

    describe('safeParseWithValidationError', () => {
        const testSchema = z.object({
            name: z.string().min(2),
            age: z.number().positive(),
        });

        it('should parse valid data', () => {
            const data = { name: 'João', age: 30 };
            const result = safeParseWithValidationError(testSchema, data, 'Test');
            expect(result).toEqual(data);
        });

        it('should throw ValidationError for invalid data', () => {
            const data = { name: 'A', age: -5 };
            expect(() => safeParseWithValidationError(testSchema, data, 'Test'))
                .toThrow(ValidationError);
        });
    });

    describe('Zod validators', () => {
        describe('phoneNumberValidator', () => {
            it('should validate correct phone number', () => {
                const result = phoneNumberValidator.safeParse('+5511987654321');
                expect(result.success).toBe(true);
            });

            it('should reject invalid phone number', () => {
                const result = phoneNumberValidator.safeParse('invalid');
                expect(result.success).toBe(false);
            });
        });

        describe('documentValidator', () => {
            it('should validate CPF', () => {
                const result = documentValidator.safeParse('11144477735');
                expect(result.success).toBe(true);
            });

            it('should validate CNPJ', () => {
                const result = documentValidator.safeParse('11222333000181');
                expect(result.success).toBe(true);
            });

            it('should validate undefined', () => {
                const result = documentValidator.safeParse(undefined);
                expect(result.success).toBe(true);
            });

            it('should reject invalid document', () => {
                const result = documentValidator.safeParse('invalid');
                expect(result.success).toBe(false);
            });
        });

        describe('cpfValidator', () => {
            it('should validate correct CPF', () => {
                const result = cpfValidator.safeParse('11144477735');
                expect(result.success).toBe(true);
            });

            it('should reject invalid CPF', () => {
                const result = cpfValidator.safeParse('12345678901');
                expect(result.success).toBe(false);
            });
        });

        describe('cnpjValidator', () => {
            it('should validate correct CNPJ', () => {
                const result = cnpjValidator.safeParse('11222333000181');
                expect(result.success).toBe(true);
            });

            it('should reject invalid CNPJ', () => {
                const result = cnpjValidator.safeParse('12345678000100'); // Invalid CNPJ
                expect(result.success).toBe(false);
            });
        });
    });
});