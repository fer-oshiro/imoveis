import { Payment } from '../../entities/payment.entity'
import { PaymentStatus, PaymentType } from '../../vo/payment-enums.vo'
import { ValidationError } from '../../../shared/errors/domain-error'

// @ts-ignore - Test file with potential mock typing issues

describe('Payment Entity', () => {
  const validData = {
    paymentId: 'PAY_123',
    apartmentUnitCode: 'A101',
    userPhoneNumber: '+5511987654321',
    amount: 2000,
    dueDate: new Date('2024-01-15'),
    contractId: 'CONTRACT123',
    createdBy: 'test-user',
  }

  describe('create', () => {
    it('should create a valid payment', () => {
      const payment = Payment.create(validData)

      expect(payment.apartmentUnitCodeValue).toBe('A101')
      expect(payment.userPhoneNumberValue).toBe('+5511987654321')
      expect(payment.amountValue).toBe(2000)
      expect(payment.dueDateValue).toEqual(new Date('2024-01-15'))
      expect(payment.contractIdValue).toBe('CONTRACT123')
      expect(payment.statusValue).toBe(PaymentStatus.PENDING)
      expect(payment.paymentDateValue).toBeUndefined()
      expect(payment.proofDocumentKeyValue).toBeUndefined()
      expect(payment.validatedByValue).toBeUndefined()
      expect(payment.validatedAtValue).toBeUndefined()
    })

    it('should generate correct DynamoDB keys', () => {
      const payment = Payment.create(validData)

      expect(payment.pkValue).toBe('APARTMENT#A101')
      expect(payment.skValue).toMatch(/^PAYMENT#\d{13}#PAY_123/)
      expect(payment.paymentIdValue).toBe('PAY_123')
    })

    it('should create payment with optional fields', () => {
      const dataWithOptionals = {
        ...validData,
        status: PaymentStatus.PAID,
        type: PaymentType.CLEANING_FEE,
        description: 'Monthly cleaning fee',
      }

      const payment = Payment.create(dataWithOptionals)

      expect(payment.statusValue).toBe(PaymentStatus.PAID)
      expect(payment.typeValue).toBe(PaymentType.CLEANING_FEE)
      expect(payment.descriptionValue).toBe('Monthly cleaning fee')
    })
  })

  describe('business logic methods', () => {
    let payment: Payment

    beforeEach(() => {
      payment = Payment.create(validData)
    })

    describe('submitProof', () => {
      it('should submit payment proof', () => {
        const proofKey = 'proof123.pdf'
        const paymentDate = new Date('2024-01-10')

        payment.submitProof(proofKey, paymentDate, 'submitter')

        expect(payment.proofDocumentKey).toBe(proofKey)
        expect(payment.paymentDate).toEqual(paymentDate)
        expect(payment.status).toBe(PaymentStatus.PAID)
      })

      it('should update metadata when submitting proof', () => {
        const originalVersion = payment.metadata.version
        payment.submitProof('proof.pdf', new Date(), 'submitter')

        expect(payment.metadata.version).toBe(originalVersion + 1)
        expect(payment.metadata.updatedBy).toBe('submitter')
      })

      it('should throw error if already validated', () => {
        payment.submitProof('proof.pdf', new Date())
        payment.validate('validator')

        expect(() => payment.submitProof('proof.pdf', new Date())).toThrow(Error)
      })

      it('should allow resubmitting proof if not validated', () => {
        payment.submitProof('proof1.pdf', new Date('2024-01-10'))
        payment.submitProof('proof2.pdf', new Date('2024-01-11'), 'submitter')

        expect(payment.proofDocumentKey).toBe('proof2.pdf')
        expect(payment.paymentDate).toEqual(new Date('2024-01-11'))
      })
    })

    describe('validate', () => {
      it('should validate payment with proof', () => {
        payment.submitProof('proof.pdf', new Date('2024-01-10'))
        payment.validate('validator')

        expect(payment.statusValue).toBe(PaymentStatus.VALIDATED)
        expect(payment.validatedByValue).toBe('validator')
        expect(payment.validatedAtValue).toBeInstanceOf(Date)
      })

      it('should throw error if no proof submitted', () => {
        expect(() => payment.validate('validator')).toThrow('Only paid payments can be validated')
      })

      it('should throw error if already validated', () => {
        payment.submitProof('proof.pdf', new Date())
        payment.validate('validator1')

        expect(() => payment.validate('validator2')).toThrow('Only paid payments can be validated')
      })
    })

    describe('reject', () => {
      it('should reject payment with proof', () => {
        payment.submitProof('proof.pdf', new Date('2024-01-10'))
        payment.reject('rejector', 'rejector')

        expect(payment.statusValue).toBe(PaymentStatus.REJECTED)
        expect(payment.validatedByValue).toBe('rejector')
        expect(payment.validatedAtValue).toBeInstanceOf(Date)
      })

      it('should throw error if no proof submitted', () => {
        expect(() => payment.reject('rejector')).toThrow('Only paid payments can be rejected')
      })

      it('should throw error if already validated', () => {
        payment.submitProof('proof.pdf', new Date())
        payment.validate('validator')

        expect(() => payment.reject('rejector')).toThrow('Only paid payments can be rejected')
      })
    })

    describe('markOverdue', () => {
      it('should mark pending payment as overdue', () => {
        payment.markOverdue('system')

        expect(payment.statusValue).toBe(PaymentStatus.OVERDUE)
      })

      it('should not mark paid payment as overdue', () => {
        payment.submitProof('proof.pdf', new Date())

        expect(() => payment.markOverdue()).toThrow(Error)
      })

      it('should not mark validated payment as overdue', () => {
        payment.submitProof('proof.pdf', new Date())
        payment.validate('validator')

        expect(() => payment.markOverdue()).toThrow(Error)
      })
    })

    describe('status checks', () => {
      it('should check if payment is pending', () => {
        expect(payment.isPending()).toBe(true)

        payment.submitProof('proof.pdf', new Date())
        expect(payment.isPending()).toBe(false)
      })

      it('should check if payment is paid', () => {
        expect(payment.isPaid()).toBe(false)

        payment.submitProof('proof.pdf', new Date())
        expect(payment.isPaid()).toBe(true)
      })

      it('should check if payment is validated', () => {
        expect(payment.isValidated()).toBe(false)

        payment.submitProof('proof.pdf', new Date())
        payment.validate('validator')
        expect(payment.isValidated()).toBe(true)
      })

      it('should check if payment is overdue', () => {
        expect(payment.isOverdue()).toBe(false)

        payment.markOverdue()
        expect(payment.isOverdue()).toBe(true)
      })

      it('should check if payment is rejected', () => {
        expect(payment.isRejected()).toBe(false)

        payment.submitProof('proof.pdf', new Date())
        payment.reject('rejector')
        expect(payment.isRejected()).toBe(true)
      })
    })

    describe('date calculations', () => {
      it('should calculate days until due date', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 5)

        const futurePayment = Payment.create({
          ...validData,
          dueDate: futureDate,
        })

        expect(futurePayment.getDaysUntilDue()).toBe(5)
      })

      it('should calculate negative days for overdue payments', () => {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 3)

        const overduePayment = Payment.create({
          ...validData,
          dueDate: pastDate,
        })

        expect(overduePayment.getDaysUntilDue()).toBe(-3)
      })
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const payment = Payment.create(validData)
      payment.submitProof('proof.pdf', new Date('2024-01-10'))

      const json = payment.toJSON()

      expect(json.paymentId).toBe('PAY_123')
      expect(json.apartmentUnitCode).toBe('A101')
      expect(json.userPhoneNumber).toBe('+5511987654321')
      expect(json.amount).toBe(2000)
      expect(json.dueDate).toBe('2024-01-15T00:00:00.000Z')
      expect(json.paymentDate).toBe('2024-01-10T00:00:00.000Z')
      expect(json.proofDocumentKey).toBe('proof.pdf')
      expect(json.status).toBe(PaymentStatus.PAID)
      expect(json.contractId).toBe('CONTRACT123')
      expect(json.createdAt).toBeDefined()
      expect(json.updatedAt).toBeDefined()
    })

    it('should deserialize from DynamoDB item correctly', () => {
      const item = {
        pk: 'APARTMENT#A101',
        sk: 'PAYMENT#1704067200000#PAY_123',
        paymentId: 'PAY_123',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511987654321',
        amount: 2000,
        dueDate: '2024-01-15T00:00:00.000Z',
        paymentDate: '2024-01-10T00:00:00.000Z',
        proofDocumentKey: 'proof.pdf',
        status: PaymentStatus.PAID,
        type: PaymentType.RENT,
        contractId: 'CONTRACT123',
        validatedBy: 'validator',
        validatedAt: '2024-01-11T00:00:00.000Z',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      }

      const payment = Payment.fromJSON(item)

      expect(payment.paymentIdValue).toBe('PAY_123')
      expect(payment.apartmentUnitCodeValue).toBe('A101')
      expect(payment.userPhoneNumberValue).toBe('+5511987654321')
      expect(payment.amountValue).toBe(2000)
      expect(payment.dueDateValue).toEqual(new Date('2024-01-15'))
      expect(payment.paymentDateValue).toEqual(new Date('2024-01-10'))
      expect(payment.proofDocumentKeyValue).toBe('proof.pdf')
      expect(payment.statusValue).toBe(PaymentStatus.PAID)
      expect(payment.contractIdValue).toBe('CONTRACT123')
      expect(payment.validatedByValue).toBe('validator')
      expect(payment.validatedAtValue).toEqual(new Date('2024-01-11'))
    })

    it('should handle missing optional fields in deserialization', () => {
      const minimalItem = {
        pk: 'APARTMENT#A101',
        sk: 'PAYMENT#1704067200000#PAY_123',
        paymentId: 'PAY_123',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511987654321',
        amount: 2000,
        dueDate: '2024-01-15T00:00:00.000Z',
        status: PaymentStatus.PENDING,
        type: PaymentType.RENT,
        contractId: 'CONTRACT123',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      }

      const payment = Payment.fromJSON(minimalItem)

      expect(payment.paymentDateValue).toBeUndefined()
      expect(payment.proofDocumentKeyValue).toBeUndefined()
      expect(payment.validatedByValue).toBeUndefined()
      expect(payment.validatedAtValue).toBeUndefined()
    })
  })
})
