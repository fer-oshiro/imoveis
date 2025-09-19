import { User, UserStatus } from '../../entities/user.entity'
import { ValidationError } from '../../../shared/errors/domain-error'

describe('User Entity', () => {
  const validData = {
    phoneNumber: '11987654321',
    name: 'João Silva',
    document: '11144477735', // Valid CPF
    email: 'joao@example.com',
    createdBy: 'test-user',
  }

  describe('create', () => {
    it('should create a valid user with all fields', () => {
      const user = User.create(validData)

      expect(user.phoneNumber.value).toBe('+5511987654321')
      expect(user.name).toBe('João Silva')
      expect(user.document.value).toBe('11144477735')
      expect(user.email).toBe('joao@example.com')
      expect(user.status).toBe(UserStatus.ACTIVE)
      expect(user.isActive).toBe(true)
      expect(user.pk).toBe('USER#+5511987654321')
      expect(user.sk).toBe('PROFILE')
    })

    it('should create user with minimal required fields', () => {
      const minimalData = {
        phoneNumber: '11987654321',
        name: 'João Silva',
      }

      const user = User.create(minimalData)

      expect(user.phoneNumber.value).toBe('+5511987654321')
      expect(user.name).toBe('João Silva')
      expect(user.document.value).toBeUndefined() // Empty document
      expect(user.email).toBeUndefined()
      expect(user.status).toBe(UserStatus.ACTIVE)
    })

    it('should create user with custom status', () => {
      const userData = {
        ...validData,
        status: UserStatus.INACTIVE,
      }

      const user = User.create(userData)

      expect(user.status).toBe(UserStatus.INACTIVE)
      expect(user.isActive).toBe(false)
    })

    it('should trim name and email', () => {
      const userData = {
        ...validData,
        name: '  João Silva  ',
        email: '  joao@example.com  ',
      }

      const user = User.create(userData)

      expect(user.name).toBe('João Silva')
      expect(user.email).toBe('joao@example.com')
    })

    it('should throw error for invalid name', () => {
      const invalidData = {
        ...validData,
        name: '', // Empty name
      }

      expect(() => User.create(invalidData)).toThrow(ValidationError)
    })

    it('should throw error for invalid email', () => {
      const invalidData = {
        ...validData,
        email: 'invalid-email',
      }

      expect(() => User.create(invalidData)).toThrow(ValidationError)
    })

    it('should throw error for invalid phone number', () => {
      const invalidData = {
        ...validData,
        phoneNumber: '123', // Invalid phone
      }

      expect(() => User.create(invalidData)).toThrow(ValidationError)
    })
  })

  describe('business logic methods', () => {
    let user: User

    beforeEach(() => {
      user = User.create(validData)
    })

    describe('updateProfile', () => {
      it('should update name', () => {
        user.updateProfile({ name: 'Maria Silva', updatedBy: 'updater' })

        expect(user.name).toBe('Maria Silva')
        expect(user.metadata.updatedBy).toBe('updater')
      })

      it('should update email', () => {
        user.updateProfile({ email: 'maria@example.com', updatedBy: 'updater' })

        expect(user.email).toBe('maria@example.com')
      })

      it('should clear email', () => {
        user.updateProfile({ email: undefined, updatedBy: 'updater' })

        expect(user.email).toBeUndefined()
      })

      it('should update both name and email', () => {
        user.updateProfile({
          name: 'Maria Silva',
          email: 'maria@example.com',
          updatedBy: 'updater',
        })

        expect(user.name).toBe('Maria Silva')
        expect(user.email).toBe('maria@example.com')
      })

      it('should trim updated values', () => {
        user.updateProfile({
          name: '  Maria Silva  ',
          email: 'maria@example.com',
        })

        expect(user.name).toBe('Maria Silva')
        expect(user.email).toBe('maria@example.com')
      })

      it('should throw error for invalid name', () => {
        expect(() => user.updateProfile({ name: '' })).toThrow(ValidationError)
      })

      it('should throw error for invalid email', () => {
        expect(() => user.updateProfile({ email: 'invalid-email' })).toThrow(ValidationError)
      })

      it('should update metadata version', () => {
        const originalVersion = user.metadata.version
        user.updateProfile({ name: 'Maria Silva' })

        expect(user.metadata.version).toBe(originalVersion + 1)
      })
    })

    describe('activate', () => {
      it('should activate inactive user', () => {
        user.deactivate()
        user.activate('activator')

        expect(user.status).toBe(UserStatus.ACTIVE)
        expect(user.isActive).toBe(true)
        expect(user.metadata.updatedBy).toBe('activator')
      })

      it('should activate suspended user', () => {
        user.suspend()
        user.activate('activator')

        expect(user.status).toBe(UserStatus.ACTIVE)
        expect(user.isActive).toBe(true)
      })

      it('should throw error when activating already active user', () => {
        expect(() => user.activate()).toThrow(ValidationError)
        expect(() => user.activate()).toThrow('User is already active')
      })
    })

    describe('deactivate', () => {
      it('should deactivate active user', () => {
        user.deactivate('deactivator')

        expect(user.status).toBe(UserStatus.INACTIVE)
        expect(user.isActive).toBe(false)
        expect(user.metadata.updatedBy).toBe('deactivator')
      })

      it('should deactivate suspended user', () => {
        user.suspend()
        user.deactivate('deactivator')

        expect(user.status).toBe(UserStatus.INACTIVE)
        expect(user.isActive).toBe(false)
      })

      it('should throw error when deactivating already inactive user', () => {
        user.deactivate()
        expect(() => user.deactivate()).toThrow(ValidationError)
        expect(() => user.deactivate()).toThrow('User is already inactive')
      })
    })

    describe('suspend', () => {
      it('should suspend active user', () => {
        user.suspend('suspender')

        expect(user.status).toBe(UserStatus.SUSPENDED)
        expect(user.isActive).toBe(false)
        expect(user.metadata.updatedBy).toBe('suspender')
      })

      it('should suspend inactive user', () => {
        user.deactivate()
        user.suspend('suspender')

        expect(user.status).toBe(UserStatus.SUSPENDED)
        expect(user.isActive).toBe(false)
      })

      it('should throw error when suspending already suspended user', () => {
        user.suspend()
        expect(() => user.suspend()).toThrow(ValidationError)
        expect(() => user.suspend()).toThrow('User is already suspended')
      })
    })
  })

  describe('serialization', () => {
    it('should serialize to DynamoDB item correctly', () => {
      const user = User.create(validData)
      const item = user.toDynamoItem()

      expect(item.pk).toBe('USER#+5511987654321')
      expect(item.sk).toBe('PROFILE')
      expect(item.phoneNumber).toBe('+5511987654321')
      expect(item.name).toBe('João Silva')
      expect(item.document).toBe('11144477735')
      expect(item.documentType).toBe('cpf')
      expect(item.email).toBe('joao@example.com')
      expect(item.status).toBe(UserStatus.ACTIVE)
      expect(item.metadata).toBeDefined()
    })

    it('should serialize to JSON correctly', () => {
      const user = User.create(validData)
      const json = user.toJSON()

      expect(json.phoneNumber).toBe('+55 11 98765 4321') // Formatted
      expect(json.name).toBe('João Silva')
      expect(json.document).toBe('111.444.777-35') // Formatted CPF
      expect(json.documentType).toBe('cpf')
      expect(json.email).toBe('joao@example.com')
      expect(json.status).toBe(UserStatus.ACTIVE)
      expect(json.isActive).toBe(true)
      expect(json.createdAt).toBeInstanceOf(Date)
      expect(json.updatedAt).toBeInstanceOf(Date)
    })

    it('should deserialize from DynamoDB item correctly', () => {
      const item = {
        pk: 'USER#+5511987654321',
        sk: 'PROFILE',
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        document: '11144477735',
        email: 'joao@example.com',
        status: UserStatus.ACTIVE,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      }

      const user = User.fromDynamoItem(item)

      expect(user.phoneNumber.value).toBe('+5511987654321')
      expect(user.name).toBe('João Silva')
      expect(user.document.value).toBe('11144477735')
      expect(user.email).toBe('joao@example.com')
      expect(user.status).toBe(UserStatus.ACTIVE)
    })

    it('should handle legacy CPF field', () => {
      const legacyItem = {
        pk: 'USER#+5511987654321',
        sk: 'PROFILE',
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        cpf: '11144477735', // Legacy field
        email: 'joao@example.com',
        status: UserStatus.ACTIVE,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      }

      const user = User.fromDynamoItem(legacyItem)

      expect(user.document.value).toBe('11144477735')
      expect(user.document.type).toBe('cpf')
    })

    it('should handle missing optional fields', () => {
      const minimalItem = {
        pk: 'USER#+5511987654321',
        sk: 'PROFILE',
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        status: UserStatus.ACTIVE,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      }

      const user = User.fromDynamoItem(minimalItem)

      expect(user.phoneNumber.value).toBe('+5511987654321')
      expect(user.name).toBe('João Silva')
      expect(user.document.value).toBeUndefined()
      expect(user.email).toBeUndefined()
      expect(user.status).toBe(UserStatus.ACTIVE)
    })
  })

  describe('UserStatus enum', () => {
    it('should have correct status values', () => {
      expect(UserStatus.ACTIVE).toBe('active')
      expect(UserStatus.INACTIVE).toBe('inactive')
      expect(UserStatus.SUSPENDED).toBe('suspended')
    })
  })
})
