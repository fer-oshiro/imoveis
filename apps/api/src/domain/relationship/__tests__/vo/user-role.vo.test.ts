import { ValidationError } from '../../../shared/errors/domain-error'
import { UserRoleVO, UserRole } from '../../vo/user-role.vo'

describe('UserRoleVO', () => {
  describe('create', () => {
    it('should create valid user roles', () => {
      const primaryTenant = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      expect(primaryTenant.value).toBe(UserRole.PRIMARY_TENANT)

      const secondaryTenant = UserRoleVO.create(UserRole.SECONDARY_TENANT)
      expect(secondaryTenant.value).toBe(UserRole.SECONDARY_TENANT)

      const emergencyContact = UserRoleVO.create(UserRole.EMERGENCY_CONTACT)
      expect(emergencyContact.value).toBe(UserRole.EMERGENCY_CONTACT)

      const admin = UserRoleVO.create(UserRole.ADMIN)
      expect(admin.value).toBe(UserRole.ADMIN)

      const ops = UserRoleVO.create(UserRole.OPS)
      expect(ops.value).toBe(UserRole.OPS)
    })

    it('should create from string values', () => {
      const role = UserRoleVO.create('primary_tenant')
      expect(role.value).toBe(UserRole.PRIMARY_TENANT)
    })

    it('should throw error for invalid role', () => {
      expect(() => UserRoleVO.create('invalid_role' as UserRole)).toThrow(ValidationError)
    })

    it('should throw error for empty role', () => {
      expect(() => UserRoleVO.create('' as UserRole)).toThrow(ValidationError)
    })

    it('should throw error for null role', () => {
      expect(() => UserRoleVO.create(null as any)).toThrow(ValidationError)
    })
  })

  describe('role type checks', () => {
    it('should correctly identify primary tenant', () => {
      const role = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      expect(role.isPrimaryTenant).toBe(true)
      expect(role.isSecondaryTenant).toBe(false)
      expect(role.isTenant).toBe(true)
      expect(role.isEmergencyContact).toBe(false)
      expect(role.isAdmin).toBe(false)
      expect(role.isOps).toBe(false)
      expect(role.isStaff).toBe(false)
    })

    it('should correctly identify secondary tenant', () => {
      const role = UserRoleVO.create(UserRole.SECONDARY_TENANT)
      expect(role.isPrimaryTenant).toBe(false)
      expect(role.isSecondaryTenant).toBe(true)
      expect(role.isTenant).toBe(true)
      expect(role.isEmergencyContact).toBe(false)
      expect(role.isAdmin).toBe(false)
      expect(role.isOps).toBe(false)
      expect(role.isStaff).toBe(false)
    })

    it('should correctly identify emergency contact', () => {
      const role = UserRoleVO.create(UserRole.EMERGENCY_CONTACT)
      expect(role.isPrimaryTenant).toBe(false)
      expect(role.isSecondaryTenant).toBe(false)
      expect(role.isTenant).toBe(false)
      expect(role.isEmergencyContact).toBe(true)
      expect(role.isAdmin).toBe(false)
      expect(role.isOps).toBe(false)
      expect(role.isStaff).toBe(false)
    })

    it('should correctly identify admin', () => {
      const role = UserRoleVO.create(UserRole.ADMIN)
      expect(role.isPrimaryTenant).toBe(false)
      expect(role.isSecondaryTenant).toBe(false)
      expect(role.isTenant).toBe(false)
      expect(role.isEmergencyContact).toBe(false)
      expect(role.isAdmin).toBe(true)
      expect(role.isOps).toBe(false)
      expect(role.isStaff).toBe(true)
    })

    it('should correctly identify ops', () => {
      const role = UserRoleVO.create(UserRole.OPS)
      expect(role.isPrimaryTenant).toBe(false)
      expect(role.isSecondaryTenant).toBe(false)
      expect(role.isTenant).toBe(false)
      expect(role.isEmergencyContact).toBe(false)
      expect(role.isAdmin).toBe(false)
      expect(role.isOps).toBe(true)
      expect(role.isStaff).toBe(true)
    })
  })

  describe('permission checks', () => {
    it('should allow tenants to manage payments', () => {
      const primaryTenant = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      const secondaryTenant = UserRoleVO.create(UserRole.SECONDARY_TENANT)
      const admin = UserRoleVO.create(UserRole.ADMIN)
      const ops = UserRoleVO.create(UserRole.OPS)
      const emergencyContact = UserRoleVO.create(UserRole.EMERGENCY_CONTACT)

      expect(primaryTenant.canManagePayments).toBe(true)
      expect(secondaryTenant.canManagePayments).toBe(true)
      expect(admin.canManagePayments).toBe(true)
      expect(ops.canManagePayments).toBe(true)
      expect(emergencyContact.canManagePayments).toBe(false)
    })

    it('should allow appropriate roles to view apartment details', () => {
      const primaryTenant = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      const secondaryTenant = UserRoleVO.create(UserRole.SECONDARY_TENANT)
      const emergencyContact = UserRoleVO.create(UserRole.EMERGENCY_CONTACT)
      const admin = UserRoleVO.create(UserRole.ADMIN)
      const ops = UserRoleVO.create(UserRole.OPS)

      expect(primaryTenant.canViewApartmentDetails).toBe(true)
      expect(secondaryTenant.canViewApartmentDetails).toBe(true)
      expect(emergencyContact.canViewApartmentDetails).toBe(true)
      expect(admin.canViewApartmentDetails).toBe(true)
      expect(ops.canViewApartmentDetails).toBe(true)
    })
  })

  describe('equality and serialization', () => {
    it('should check equality correctly', () => {
      const role1 = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      const role2 = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      const role3 = UserRoleVO.create(UserRole.SECONDARY_TENANT)

      expect(role1.equals(role2)).toBe(true)
      expect(role1.equals(role3)).toBe(false)
    })

    it('should serialize to string correctly', () => {
      const role = UserRoleVO.create(UserRole.PRIMARY_TENANT)
      expect(role.toString()).toBe('primary_tenant')
      expect(role.toJSON()).toBe('primary_tenant')
    })

    it('should deserialize from JSON correctly', () => {
      const role = UserRoleVO.fromJSON('primary_tenant')
      expect(role.value).toBe(UserRole.PRIMARY_TENANT)
    })
  })
})
