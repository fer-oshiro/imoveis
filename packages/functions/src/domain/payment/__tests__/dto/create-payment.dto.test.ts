import {
  CreatePaymentDto,
  validateCreatePaymentDto,
  SubmitPaymentProofDto,
  validateSubmitPaymentProofDto,
  ValidatePaymentDto,
  validateValidatePaymentDto,
  UpdatePaymentDto,
  validateUpdatePaymentDto,
} from '../../dto/create-payment.dto'
import { PaymentType } from '../../vo/payment-enums.vo'

describe.skip('Payment DTOs', () => {
  describe('CreatePaymentDtoValidator', () => {
    const validInputDto = {
      apartmentUnitCode: 'APT001',
      userPhoneNumber: '+5511999999999',
      amount: 1500.0,
      dueDate: '2024-01-15T00:00:00.000Z',
      contractId: 'CONTRACT-001',
      type: PaymentType.RENT,
      description: 'Monthly rent payment',
      createdBy: 'admin',
    }

    describe('validate', () => {
      it('should validate valid DTO', () => {
        expect(() => {
          CreatePaymentDtoValidator.validate(validDto)
        }).not.toThrow()
      })

      it('should throw error for missing apartment unit code', () => {
        const invalidDto = { ...validDto, apartmentUnitCode: '' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Apartment unit code is required')
      })

      it('should throw error for missing user phone number', () => {
        const invalidDto = { ...validDto, userPhoneNumber: '' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('User phone number is required')
      })

      it('should throw error for invalid amount', () => {
        const invalidDto1 = { ...validDto, amount: 0 }
        const invalidDto2 = { ...validDto, amount: -100 }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto1)
        }).toThrow('Amount must be greater than zero')

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto2)
        }).toThrow('Amount must be greater than zero')
      })

      it('should throw error for missing due date', () => {
        const invalidDto = { ...validDto, dueDate: '' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Due date is required')
      })

      it('should throw error for invalid due date format', () => {
        const invalidDto = { ...validDto, dueDate: 'invalid-date' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Invalid due date format')
      })

      it('should throw error for missing contract ID', () => {
        const invalidDto = { ...validDto, contractId: '' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Contract ID is required')
      })

      it('should throw error for invalid phone number format', () => {
        const invalidDto = { ...validDto, userPhoneNumber: 'invalid-phone' }

        expect(() => {
          CreatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Invalid phone number format')
      })
    })

    describe('sanitize', () => {
      it('should sanitize DTO correctly', () => {
        const dirtyDto = {
          ...validDto,
          apartmentUnitCode: '  apt001  ',
          userPhoneNumber: '  +5511999999999  ',
          contractId: '  contract-001  ',
          description: '  Monthly rent payment  ',
          createdBy: '  admin  ',
        }

        const sanitized = CreatePaymentDtoValidator.sanitize(dirtyDto)

        expect(sanitized.apartmentUnitCode).toBe('APT001')
        expect(sanitized.userPhoneNumber).toBe('+5511999999999')
        expect(sanitized.contractId).toBe('contract-001')
        expect(sanitized.description).toBe('Monthly rent payment')
        expect(sanitized.createdBy).toBe('admin')
      })
    })
  })

  describe('SubmitPaymentProofDtoValidator', () => {
    const validDto: SubmitPaymentProofDto = {
      paymentId: 'PAY-001-123456',
      proofDocumentKey: 'proof-document-123.pdf',
      paymentDate: '2024-01-14T00:00:00.000Z',
      updatedBy: 'user',
    }

    describe('validate', () => {
      it('should validate valid DTO', () => {
        expect(() => {
          SubmitPaymentProofDtoValidator.validate(validDto)
        }).not.toThrow()
      })

      it('should throw error for missing payment ID', () => {
        const invalidDto = { ...validDto, paymentId: '' }

        expect(() => {
          SubmitPaymentProofDtoValidator.validate(invalidDto)
        }).toThrow('Payment ID is required')
      })

      it('should throw error for missing proof document key', () => {
        const invalidDto = { ...validDto, proofDocumentKey: '' }

        expect(() => {
          SubmitPaymentProofDtoValidator.validate(invalidDto)
        }).toThrow('Proof document key is required')
      })

      it('should throw error for missing payment date', () => {
        const invalidDto = { ...validDto, paymentDate: '' }

        expect(() => {
          SubmitPaymentProofDtoValidator.validate(invalidDto)
        }).toThrow('Payment date is required')
      })

      it('should throw error for invalid payment date format', () => {
        const invalidDto = { ...validDto, paymentDate: 'invalid-date' }

        expect(() => {
          SubmitPaymentProofDtoValidator.validate(invalidDto)
        }).toThrow('Invalid payment date format')
      })

      it('should throw error for future payment date', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)
        const invalidDto = { ...validDto, paymentDate: futureDate.toISOString() }

        expect(() => {
          SubmitPaymentProofDtoValidator.validate(invalidDto)
        }).toThrow('Payment date cannot be in the future')
      })
    })

    describe('sanitize', () => {
      it('should sanitize DTO correctly', () => {
        const dirtyDto = {
          ...validDto,
          paymentId: '  PAY-001-123456  ',
          proofDocumentKey: '  proof-document-123.pdf  ',
          updatedBy: '  user  ',
        }

        const sanitized = SubmitPaymentProofDtoValidator.sanitize(dirtyDto)

        expect(sanitized.paymentId).toBe('PAY-001-123456')
        expect(sanitized.proofDocumentKey).toBe('proof-document-123.pdf')
        expect(sanitized.updatedBy).toBe('user')
      })
    })
  })

  describe('ValidatePaymentDtoValidator', () => {
    const validDto: ValidatePaymentDto = {
      paymentId: 'PAY-001-123456',
      validatedBy: 'admin',
      action: 'validate',
    }

    describe('validate', () => {
      it('should validate valid DTO', () => {
        expect(() => {
          ValidatePaymentDtoValidator.validate(validDto)
        }).not.toThrow()
      })

      it('should validate reject action', () => {
        const rejectDto = { ...validDto, action: 'reject' as const }

        expect(() => {
          ValidatePaymentDtoValidator.validate(rejectDto)
        }).not.toThrow()
      })

      it('should throw error for missing payment ID', () => {
        const invalidDto = { ...validDto, paymentId: '' }

        expect(() => {
          ValidatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Payment ID is required')
      })

      it('should throw error for missing validator ID', () => {
        const invalidDto = { ...validDto, validatedBy: '' }

        expect(() => {
          ValidatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Validator ID is required')
      })

      it('should throw error for invalid action', () => {
        const invalidDto = { ...validDto, action: 'invalid' as any }

        expect(() => {
          ValidatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Action must be either "validate" or "reject"')
      })
    })

    describe('sanitize', () => {
      it('should sanitize DTO correctly', () => {
        const dirtyDto = {
          ...validDto,
          paymentId: '  PAY-001-123456  ',
          validatedBy: '  admin  ',
        }

        const sanitized = ValidatePaymentDtoValidator.sanitize(dirtyDto)

        expect(sanitized.paymentId).toBe('PAY-001-123456')
        expect(sanitized.validatedBy).toBe('admin')
      })
    })
  })

  describe('UpdatePaymentDtoValidator', () => {
    const validDto: UpdatePaymentDto = {
      amount: 2000.0,
      dueDate: '2024-02-15T00:00:00.000Z',
      description: 'Updated description',
      updatedBy: 'admin',
    }

    describe('validate', () => {
      it('should validate valid DTO', () => {
        expect(() => {
          UpdatePaymentDtoValidator.validate(validDto)
        }).not.toThrow()
      })

      it('should validate empty DTO', () => {
        expect(() => {
          UpdatePaymentDtoValidator.validate({})
        }).not.toThrow()
      })

      it('should throw error for invalid amount', () => {
        const invalidDto1 = { ...validDto, amount: 0 }
        const invalidDto2 = { ...validDto, amount: -100 }

        expect(() => {
          UpdatePaymentDtoValidator.validate(invalidDto1)
        }).toThrow('Amount must be greater than zero')

        expect(() => {
          UpdatePaymentDtoValidator.validate(invalidDto2)
        }).toThrow('Amount must be greater than zero')
      })

      it('should throw error for invalid due date format', () => {
        const invalidDto = { ...validDto, dueDate: 'invalid-date' }

        expect(() => {
          UpdatePaymentDtoValidator.validate(invalidDto)
        }).toThrow('Invalid due date format')
      })
    })

    describe('sanitize', () => {
      it('should sanitize DTO correctly', () => {
        const dirtyDto = {
          ...validDto,
          description: '  Updated description  ',
          updatedBy: '  admin  ',
        }

        const sanitized = UpdatePaymentDtoValidator.sanitize(dirtyDto)

        expect(sanitized.description).toBe('Updated description')
        expect(sanitized.updatedBy).toBe('admin')
      })
    })
  })
})
