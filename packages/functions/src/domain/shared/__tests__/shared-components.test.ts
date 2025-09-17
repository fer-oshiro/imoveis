import {
  EntityMetadataVO,
  ContactInfoVO,
  ContactMethod,
  PhoneNumberVO,
  CPFVO,
  ValidationError,
  DomainError,
  EntityNotFoundError,
} from '../index'

describe('Shared Components', () => {
  describe('EntityMetadataVO', () => {
    it('should create metadata with default values', () => {
      const metadata = EntityMetadataVO.create('user123')

      expect(metadata.createdBy).toBe('user123')
      expect(metadata.version).toBe(1)
      expect(metadata.createdAt).toBeInstanceOf(Date)
      expect(metadata.updatedAt).toBeInstanceOf(Date)
    })

    it('should update metadata correctly', async () => {
      const metadata = EntityMetadataVO.create('user123')
      // Add a small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1))
      const updated = metadata.update('user456')

      expect(updated.createdBy).toBe('user123')
      expect(updated.updatedBy).toBe('user456')
      expect(updated.version).toBe(2)
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(metadata.updatedAt.getTime())
    })
  })

  describe('PhoneNumberVO', () => {
    it('should create valid Brazilian phone number', () => {
      const phone = new PhoneNumberVO('11987654321')

      expect(phone.value).toBe('+5511987654321')
      expect(phone.formatted).toBe('+55 11 98765 4321')
      expect(phone.country).toBe('BR')
    })

    it('should create valid international phone number', () => {
      const phone = new PhoneNumberVO('+12025551234', 'US')

      expect(phone.value).toBe('+12025551234')
      expect(phone.country).toBe('US')
    })

    it('should throw error for invalid phone number', () => {
      expect(() => new PhoneNumberVO('123')).toThrow(ValidationError)
      expect(() => new PhoneNumberVO('')).toThrow(ValidationError)
    })

    it('should validate phone numbers statically', () => {
      expect(PhoneNumberVO.isValid('11987654321')).toBe(true)
      expect(PhoneNumberVO.isValid('+5511987654321')).toBe(true)
      expect(PhoneNumberVO.isValid('123')).toBe(false)
    })
  })

  describe('CPFVO', () => {
    it('should create valid CPF', () => {
      const cpf = new CPFVO('11144477735') // Valid CPF

      expect(cpf.value).toBe('11144477735')
      expect(cpf.formatted).toBe('111.444.777-35')
    })

    it('should throw error for invalid CPF', () => {
      expect(() => new CPFVO('12345678901')).toThrow(ValidationError)
      expect(() => new CPFVO('11111111111')).toThrow(ValidationError)
      expect(() => new CPFVO('')).toThrow(ValidationError)
    })
  })

  describe('ContactInfoVO', () => {
    it('should create valid contact info', () => {
      const contact = new ContactInfoVO({
        phoneNumber: '11987654321',
        contactMethod: ContactMethod.WHATSAPP,
        preferredLanguage: 'pt-BR',
      })

      expect(contact.phoneNumber).toBe('+5511987654321')
      expect(contact.contactMethod).toBe(ContactMethod.WHATSAPP)
      expect(contact.preferredLanguage).toBe('pt-BR')
      expect(contact.formattedPhoneNumber).toBe('+55 11 98765 4321')
      expect(contact.phoneCountry).toBe('BR')
    })

    it('should create contact info with international phone number', () => {
      const contact = new ContactInfoVO({
        phoneNumber: '+12025551234',
        contactMethod: ContactMethod.CALL,
        defaultCountry: 'US',
      })

      expect(contact.phoneNumber).toBe('+12025551234')
      expect(contact.phoneCountry).toBe('US')
    })

    it('should throw error for invalid phone number', () => {
      expect(
        () =>
          new ContactInfoVO({
            phoneNumber: '',
            contactMethod: ContactMethod.WHATSAPP,
          }),
      ).toThrow(ValidationError)
    })
  })

  describe('Domain Errors', () => {
    it('should create domain error with correct properties', () => {
      const error = new DomainError('Test error', 'TEST_ERROR', 400)

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('DomainError')
    })

    it('should create entity not found error', () => {
      const error = new EntityNotFoundError('User', '123')

      expect(error.message).toBe('User with identifier 123 not found')
      expect(error.code).toBe('ENTITY_NOT_FOUND')
      expect(error.statusCode).toBe(404)
    })
  })
})
