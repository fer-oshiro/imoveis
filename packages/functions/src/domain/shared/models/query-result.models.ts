import { Apartment } from '../../apartment/entities/apartment.entity'
import { User } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'

// Timeline event for apartment log
export interface TimelineEvent {
  date: Date
  type: 'contract' | 'payment' | 'status_change' | 'user_added' | 'user_removed'
  description: string
  details: Record<string, any>
  relatedEntityId?: string
}

// User with relationship information
export interface UserWithRelation {
  user: User
  role: string
  relationshipType?: string
  isActive: boolean
  relationshipCreatedAt: Date
  relationshipUpdatedAt: Date
}

// Apartment with relationship information (for user details)
export interface ApartmentWithRelation {
  apartment: Apartment
  role: string
  relationshipType?: string
  isActive: boolean
  relationshipCreatedAt: Date
  relationshipUpdatedAt: Date
}

// Payment status summary
export interface PaymentStatusSummary {
  status: 'current' | 'overdue' | 'no_payments'
  daysSinceLastPayment?: number
  totalPendingAmount?: number
  overdueCount?: number
}

// Apartment with payment information (for admin listing)
export interface ApartmentWithPaymentInfo {
  apartment: Apartment
  lastPayment?: Payment
  paymentStatus: PaymentStatusSummary
  totalPayments: number
  totalPaidAmount: number
  totalPendingAmount: number
}

// Apartment details (comprehensive view)
export interface ApartmentDetails {
  apartment: Apartment
  users: UserWithRelation[]
  activeContract?: Contract
  contractHistory: Contract[]
  recentPayments: Payment[]
  paymentSummary: PaymentStatusSummary
}

// Apartment log (historical view)
export interface ApartmentLog {
  apartment: Apartment
  contracts: Contract[]
  payments: Payment[]
  timeline: TimelineEvent[]
  statistics: {
    totalContracts: number
    totalPayments: number
    totalRevenue: number
    averageOccupancyDuration: number // in days
    currentOccupancyDuration?: number // in days
  }
}

// Apartment listing (for landing page)
export interface ApartmentListing {
  apartment: Apartment
  images: string[]
  isAvailable: boolean
  availableFrom?: Date
  airbnbLink?: string
  priceRange: {
    min: number
    max: number
  }
  features: string[]
  location: {
    address: string
    neighborhood?: string
    city?: string
  }
}

// User details (comprehensive view)
export interface UserDetails {
  user: User
  relatedUsers: UserWithRelation[]
  apartments: ApartmentWithRelation[]
  paymentHistory: Payment[]
  paymentSummary: {
    totalPayments: number
    totalPaidAmount: number
    totalPendingAmount: number
    lastPaymentDate?: Date
    averagePaymentDelay: number // in days
  }
  relationships: UserApartmentRelation[]
}

// Contract with related information
export interface ContractWithDetails {
  contract: Contract
  apartment: Apartment
  tenant: User
  payments: Payment[]
  paymentSummary: PaymentStatusSummary
}

// Payment with related information
export interface PaymentWithDetails {
  payment: Payment
  apartment: Apartment
  user: User
  contract?: Contract
}

// Aggregated apartment statistics
export interface ApartmentStatistics {
  totalApartments: number
  occupiedApartments: number
  availableApartments: number
  maintenanceApartments: number
  occupancyRate: number
  averageRent: number
  totalMonthlyRevenue: number
  airbnbApartments: number
  longTermApartments: number
}

// Aggregated user statistics
export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  primaryTenants: number
  secondaryTenants: number
  emergencyContacts: number
  adminUsers: number
}

// Aggregated payment statistics
export interface PaymentStatistics {
  totalPayments: number
  paidPayments: number
  pendingPayments: number
  overduePayments: number
  totalRevenue: number
  averagePaymentAmount: number
  averagePaymentDelay: number
  paymentComplianceRate: number
}
