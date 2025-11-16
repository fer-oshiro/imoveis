import { describe, it, expect, beforeEach, vi } from 'vitest'

import { ApartmentController } from '../apartment/apartment.controller'
import { ContractController } from '../contract/contract.controller'
import { PaymentController } from '../payment/payment.controller'
import { UserController } from '../user/user.controller'

// Mock the repositories
vi.mock('../../domain/apartment/repositories/apartment.repository', () => ({
  default: {
    getInstance: vi.fn(() => ({
      findAll: vi.fn(() => Promise.resolve([])),
      findByUnitCode: vi.fn(() => Promise.resolve(null)),
      findAvailable: vi.fn(() => Promise.resolve([])),
      findAirbnbApartments: vi.fn(() => Promise.resolve([])),
    })),
  },
}))

vi.mock('../../domain/user/repositories/user.repository', () => ({
  UserRepository: {
    getInstance: vi.fn(() => ({
      findByPhoneNumber: vi.fn(() => Promise.resolve(null)),
      findAll: vi.fn(() => Promise.resolve([])),
      existsByPhoneNumber: vi.fn(() => Promise.resolve(false)),
    })),
  },
}))

vi.mock('../../domain/contract/repositories/contract.repository', () => ({
  ContractRepository: {
    getInstance: vi.fn(() => ({
      findById: vi.fn(() => Promise.resolve(null)),
      findByApartment: vi.fn(() => Promise.resolve([])),
      findActiveByApartment: vi.fn(() => Promise.resolve(null)),
    })),
  },
}))

vi.mock('../../domain/payment/repositories/payment.repository', () => ({
  PaymentRepository: {
    getInstance: vi.fn(() => ({
      findById: vi.fn(() => Promise.resolve(null)),
      findByApartment: vi.fn(() => Promise.resolve([])),
      findLastByApartment: vi.fn(() => Promise.resolve(null)),
    })),
  },
}))

describe('HTTP Controllers', () => {
  describe('ApartmentController', () => {
    let controller: ApartmentController

    beforeEach(() => {
      controller = new ApartmentController()
    })

    it('should create an instance', () => {
      expect(controller).toBeDefined()
    })

    it('should have getApartmentsWithLastPayment method', () => {
      expect(typeof controller.getApartmentsWithLastPayment).toBe('function')
    })

    it('should have getAvailableApartments method', () => {
      expect(typeof controller.getAvailableApartments).toBe('function')
    })

    it('should have getAirbnbApartments method', () => {
      expect(typeof controller.getAirbnbApartments).toBe('function')
    })

    it('should have createApartment method', () => {
      expect(typeof controller.createApartment).toBe('function')
    })
  })

  describe('UserController', () => {
    let controller: UserController

    beforeEach(() => {
      controller = new UserController()
    })

    it('should create an instance', () => {
      expect(controller).toBeDefined()
    })

    it('should have getUserDetails method', () => {
      expect(typeof controller.getUserDetails).toBe('function')
    })

    it('should have createUser method', () => {
      expect(typeof controller.createUser).toBe('function')
    })

    it('should have getAllUsers method', () => {
      expect(typeof controller.getAllUsers).toBe('function')
    })
  })

  describe('ContractController', () => {
    let controller: ContractController

    beforeEach(() => {
      controller = new ContractController()
    })

    it('should create an instance', () => {
      expect(controller).toBeDefined()
    })

    it('should have getContractById method', () => {
      expect(typeof controller.getContractById).toBe('function')
    })

    it('should have createContract method', () => {
      expect(typeof controller.createContract).toBe('function')
    })

    it('should have getActiveContractByApartment method', () => {
      expect(typeof controller.getActiveContractByApartment).toBe('function')
    })
  })

  describe('PaymentController', () => {
    let controller: PaymentController

    beforeEach(() => {
      controller = new PaymentController()
    })

    it('should create an instance', () => {
      expect(controller).toBeDefined()
    })

    it('should have getPaymentById method', () => {
      expect(typeof controller.getPaymentById).toBe('function')
    })

    it('should have createPayment method', () => {
      expect(typeof controller.createPayment).toBe('function')
    })

    it('should have submitPaymentProof method', () => {
      expect(typeof controller.submitPaymentProof).toBe('function')
    })
  })
})
