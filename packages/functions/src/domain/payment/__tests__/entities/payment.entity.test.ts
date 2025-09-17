import { Payment } from '../../entities/payment.entity'
import { PaymentStatus, PaymentType } from '../../vo/payment-enums.vo'

describe('Payment Entity', () => {
  const mockPaymentData = {
    paymentId: 'PAY-001-123456',
    apartmentUnitCode: 'APT001',
    userPhoneNumber: '+5511999999999',
    amount: 1500.0,
    dueDate: new Date('2024-01-15'),
    contractId: 'CONTRACT-001',
    type: PaymentType.RENT,
    description: 'Monthly rent payment',
    createdBy: 'admin',
  }

  describe('create', () => {
    it('should create a new payment with default values', () => {
      const payment = Payment.create(mockPaymentData)

      expect(payment.paymentIdValue).toBe(mockPaymentData.paymentId)
      expect(payment.apartmentUnitCodeValue).toBe(mockPaymentData.apartmentUnitCode)
      expect(payment.userPhoneNumberValue).toBe(mockPaymentData.userPhoneNumber)
      expect(payment.amountValue).toBe(mockPaymentData.amount)
      expect(payment.dueDateValue).toEqual(mockPaymentData.dueDate)
      expect(payment.statusValue).toBe(PaymentStatus.PENDING)
      expect(payment.typeValue).toBe(PaymentType.RENT)
      expect(payment.contractIdValue).toBe(mockPaymentData.contractId)
      expect(payment.descriptionValue).toBe(mockPaymentData.description)
      expect(payment.paymentDateValue).toBeUndefined()
      expect(payment.proofDocumentKeyValue).toBeUndefined()
    })

    it('should create payment with custom status and type', () => {
      const customData = {
        ...mockPaymentData,
        status: PaymentStatus.PAID,
        type: PaymentType.DEPOSIT,
      }

      const payment = Payment.create(customData)

      expect(payment.statusValue).toBe(PaymentStatus.PAID)
      expect(payment.typeValue).toBe(PaymentType.DEPOSIT)
    })
  })

  describe('submitProof', () => {
    it('should submit payment proof successfully', () => {
      const payment = Payment.create(mockPaymentData)
      const proofKey = 'proof-document-123.pdf'
      const paymentDate = new Date('2024-01-14')

      payment.submitProof(proofKey, paymentDate, 'user')

      expect(payment.proofDocumentKeyValue).toBe(proofKey)
      expect(payment.paymentDateValue).toEqual(paymentDate)
      expect(payment.statusValue).toBe(PaymentStatus.PAID)
    })

    it('should throw error when submitting proof for validated payment', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')
      payment.validate('admin')

      expect(() => {
        payment.submitProof('new-proof.pdf', new Date(), 'user')
      }).toThrow('Cannot submit proof for already validated payment')
    })

    it('should throw error when submitting proof for rejected payment', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')
      payment.reject('admin', 'admin')

      expect(() => {
        payment.submitProof('new-proof.pdf', new Date(), 'user')
      }).toThrow('Cannot submit proof for rejected payment')
    })
  })

  describe('validate', () => {
    it('should validate payment successfully', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')

      payment.validate('admin')

      expect(payment.statusValue).toBe(PaymentStatus.VALIDATED)
      expect(payment.validatedByValue).toBe('admin')
      expect(payment.validatedAtValue).toBeInstanceOf(Date)
    })

    it('should throw error when validating non-paid payment', () => {
      const payment = Payment.create(mockPaymentData)

      expect(() => {
        payment.validate('admin')
      }).toThrow('Only paid payments can be validated')
    })

    it('should throw error when validating payment without proof', () => {
      const payment = Payment.create({
        ...mockPaymentData,
        status: PaymentStatus.PAID,
      })

      expect(() => {
        payment.validate('admin')
      }).toThrow('Cannot validate payment without proof document')
    })
  })

  describe('reject', () => {
    it('should reject payment successfully', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')

      payment.reject('admin', 'admin')

      expect(payment.statusValue).toBe(PaymentStatus.REJECTED)
      expect(payment.validatedByValue).toBe('admin')
      expect(payment.validatedAtValue).toBeInstanceOf(Date)
    })

    it('should throw error when rejecting non-paid payment', () => {
      const payment = Payment.create(mockPaymentData)

      expect(() => {
        payment.reject('admin', 'admin')
      }).toThrow('Only paid payments can be rejected')
    })
  })

  describe('markOverdue', () => {
    it('should mark pending payment as overdue', () => {
      const pastDueDate = new Date()
      pastDueDate.setDate(pastDueDate.getDate() - 5)

      const payment = Payment.create({
        ...mockPaymentData,
        dueDate: pastDueDate,
      })

      payment.markOverdue('system')

      expect(payment.statusValue).toBe(PaymentStatus.OVERDUE)
    })

    it('should throw error when marking non-pending payment as overdue', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')

      expect(() => {
        payment.markOverdue('system')
      }).toThrow('Only pending payments can be marked as overdue')
    })

    it('should throw error when marking payment as overdue before due date', () => {
      const futureDueDate = new Date()
      futureDueDate.setDate(futureDueDate.getDate() + 5)

      const payment = Payment.create({
        ...mockPaymentData,
        dueDate: futureDueDate,
      })

      expect(() => {
        payment.markOverdue('system')
      }).toThrow('Cannot mark payment as overdue before due date')
    })
  })

  describe('updateAmount', () => {
    it('should update payment amount successfully', () => {
      const payment = Payment.create(mockPaymentData)
      const newAmount = 2000.0

      payment.updateAmount(newAmount, 'admin')

      expect(payment.amountValue).toBe(newAmount)
    })

    it('should throw error when updating amount of validated payment', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')
      payment.validate('admin')

      expect(() => {
        payment.updateAmount(2000, 'admin')
      }).toThrow('Cannot update amount of validated payment')
    })

    it('should throw error when setting invalid amount', () => {
      const payment = Payment.create(mockPaymentData)

      expect(() => {
        payment.updateAmount(0, 'admin')
      }).toThrow('Payment amount must be greater than zero')

      expect(() => {
        payment.updateAmount(-100, 'admin')
      }).toThrow('Payment amount must be greater than zero')
    })
  })

  describe('updateDueDate', () => {
    it('should update due date successfully', () => {
      const payment = Payment.create(mockPaymentData)
      const newDueDate = new Date('2024-02-15')

      payment.updateDueDate(newDueDate, 'admin')

      expect(payment.dueDateValue).toEqual(newDueDate)
    })

    it('should update status when changing due date from overdue to future', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const payment = Payment.create({
        ...mockPaymentData,
        dueDate: pastDate,
      })
      payment.markOverdue('system')

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)

      payment.updateDueDate(futureDate, 'admin')

      expect(payment.statusValue).toBe(PaymentStatus.PENDING)
    })

    it('should throw error when updating due date of validated payment', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date(), 'user')
      payment.validate('admin')

      expect(() => {
        payment.updateDueDate(new Date(), 'admin')
      }).toThrow('Cannot update due date of validated payment')
    })
  })

  describe('status check methods', () => {
    it('should correctly identify payment status', () => {
      const payment = Payment.create(mockPaymentData)

      expect(payment.isPending()).toBe(true)
      expect(payment.isPaid()).toBe(false)
      expect(payment.isOverdue()).toBe(false)
      expect(payment.isValidated()).toBe(false)
      expect(payment.isRejected()).toBe(false)

      payment.submitProof('proof.pdf', new Date(), 'user')
      expect(payment.isPaid()).toBe(true)
      expect(payment.isPending()).toBe(false)

      payment.validate('admin')
      expect(payment.isValidated()).toBe(true)
      expect(payment.isPaid()).toBe(false)
    })
  })

  describe('getDaysOverdue', () => {
    it('should return 0 for non-overdue payments', () => {
      const payment = Payment.create(mockPaymentData)

      expect(payment.getDaysOverdue()).toBe(0)
    })

    it('should calculate days overdue correctly', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const payment = Payment.create({
        ...mockPaymentData,
        dueDate: pastDate,
      })
      payment.markOverdue('system')

      expect(payment.getDaysOverdue()).toBeGreaterThan(0)
    })
  })

  describe('getDaysUntilDue', () => {
    it('should calculate days until due correctly', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const payment = Payment.create({
        ...mockPaymentData,
        dueDate: futureDate,
      })

      expect(payment.getDaysUntilDue()).toBeGreaterThan(0)
    })
  })

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const payment = Payment.create(mockPaymentData)
      payment.submitProof('proof.pdf', new Date('2024-01-14'), 'user')

      const json = payment.toJSON()
      const deserializedPayment = Payment.fromJSON(json)

      expect(deserializedPayment.paymentIdValue).toBe(payment.paymentIdValue)
      expect(deserializedPayment.apartmentUnitCodeValue).toBe(payment.apartmentUnitCodeValue)
      expect(deserializedPayment.userPhoneNumberValue).toBe(payment.userPhoneNumberValue)
      expect(deserializedPayment.amountValue).toBe(payment.amountValue)
      expect(deserializedPayment.dueDateValue).toEqual(payment.dueDateValue)
      expect(deserializedPayment.statusValue).toBe(payment.statusValue)
      expect(deserializedPayment.proofDocumentKeyValue).toBe(payment.proofDocumentKeyValue)
      expect(deserializedPayment.paymentDateValue).toEqual(payment.paymentDateValue)
    })
  })
})
