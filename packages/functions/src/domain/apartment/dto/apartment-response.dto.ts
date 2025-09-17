import { Apartment } from "../entities/apartment.entity";

// For apartment listing with payment info (admin view)
export interface ApartmentWithPaymentInfo {
    apartment: Apartment;
    lastPayment?: {
        paymentId: string;
        amount: number;
        paymentDate: Date;
        status: string;
    };
    paymentStatus: 'current' | 'overdue' | 'no_payments';
    daysSinceLastPayment?: number;
}

// For apartment details view
export interface ApartmentDetails {
    apartment: Apartment;
    users: Array<{
        phoneNumber: string;
        name: string;
        role: string;
        relationshipType?: string;
        isActive: boolean;
    }>;
    activeContract?: {
        contractId: string;
        tenantPhoneNumber: string;
        startDate: Date;
        endDate: Date;
        monthlyRent: number;
        status: string;
    };
    contractHistory: Array<{
        contractId: string;
        tenantPhoneNumber: string;
        startDate: Date;
        endDate: Date;
        monthlyRent: number;
        status: string;
    }>;
}

// For apartment log/history view
export interface ApartmentLog {
    apartment: Apartment;
    contracts: Array<{
        contractId: string;
        tenantPhoneNumber: string;
        startDate: Date;
        endDate: Date;
        monthlyRent: number;
        status: string;
    }>;
    payments: Array<{
        paymentId: string;
        userPhoneNumber: string;
        amount: number;
        dueDate: Date;
        paymentDate?: Date;
        status: string;
    }>;
    timeline: Array<{
        date: Date;
        type: 'contract' | 'payment' | 'status_change';
        description: string;
        details: Record<string, any>;
    }>;
}

// For landing page apartment listing
export interface ApartmentListing {
    apartment: Apartment;
    images: string[];
    isAvailable: boolean;
    availableFrom?: Date;
    airbnbLink?: string;
    priceRange: {
        min: number;
        max: number;
    };
}

// For user details with apartment relationships
export interface ApartmentWithRelation {
    apartment: Apartment;
    role: string;
    relationshipType?: string;
    isActive: boolean;
}