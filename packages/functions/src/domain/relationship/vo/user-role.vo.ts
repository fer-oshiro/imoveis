import { ValidationError } from '../../shared/errors/domain-error';

export enum UserRole {
    PRIMARY_TENANT = 'primary_tenant',
    SECONDARY_TENANT = 'secondary_tenant',
    EMERGENCY_CONTACT = 'emergency_contact',
    ADMIN = 'admin',
    OPS = 'ops'
}

export class UserRoleVO {
    public readonly value: UserRole;

    constructor(role: UserRole | string) {
        this.value = this.validateAndNormalize(role);
    }

    private validateAndNormalize(role: UserRole | string): UserRole {
        if (!role) {
            throw new ValidationError('User role is required');
        }

        const normalizedRole = typeof role === 'string' ? role.toLowerCase() : role;

        if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
            throw new ValidationError(`Invalid user role: ${role}. Valid roles are: ${Object.values(UserRole).join(', ')}`);
        }

        return normalizedRole as UserRole;
    }

    static create(role: UserRole | string): UserRoleVO {
        return new UserRoleVO(role);
    }

    get isPrimaryTenant(): boolean {
        return this.value === UserRole.PRIMARY_TENANT;
    }

    get isSecondaryTenant(): boolean {
        return this.value === UserRole.SECONDARY_TENANT;
    }

    get isTenant(): boolean {
        return this.isPrimaryTenant || this.isSecondaryTenant;
    }

    get isEmergencyContact(): boolean {
        return this.value === UserRole.EMERGENCY_CONTACT;
    }

    get isAdmin(): boolean {
        return this.value === UserRole.ADMIN;
    }

    get isOps(): boolean {
        return this.value === UserRole.OPS;
    }

    get isStaff(): boolean {
        return this.isAdmin || this.isOps;
    }

    get canManagePayments(): boolean {
        return this.isTenant || this.isStaff;
    }

    get canViewApartmentDetails(): boolean {
        return this.isTenant || this.isEmergencyContact || this.isStaff;
    }

    equals(other: UserRoleVO): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }

    static fromJSON(data: string): UserRoleVO {
        return new UserRoleVO(data);
    }
}