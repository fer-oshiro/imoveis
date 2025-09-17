import { FastifyInstance } from 'fastify'
import { PaymentController } from './payment.controller'
import {
  CreatePaymentDto,
  SubmitPaymentProofDto,
  ValidatePaymentDto,
  UpdatePaymentDto,
} from '../../domain/payment/dto'
import { PaymentStatus } from '../../domain/payment/vo/payment-enums.vo'

export async function paymentRoutes(app: FastifyInstance) {
  const controller = new PaymentController()

  // Get payment by ID
  app.get('/:paymentId', async (request) => {
    const params = request.params as { paymentId: string }
    return controller.getPaymentById(params.paymentId)
  })

  // Get payments by apartment
  app.get('/apartment/:apartmentUnitCode', async (request) => {
    const params = request.params as { apartmentUnitCode: string }
    return controller.getPaymentsByApartment(params.apartmentUnitCode)
  })

  // Get last payment by apartment
  app.get('/apartment/:apartmentUnitCode/last', async (request) => {
    const params = request.params as { apartmentUnitCode: string }
    return controller.getLastPaymentByApartment(params.apartmentUnitCode)
  })

  // Get payments by user
  app.get('/user/:userPhoneNumber', async (request) => {
    const params = request.params as { userPhoneNumber: string }
    return controller.getPaymentsByUser(params.userPhoneNumber)
  })

  // Get payments by contract
  app.get('/contract/:contractId', async (request) => {
    const params = request.params as { contractId: string }
    return controller.getPaymentsByContract(params.contractId)
  })

  // Get payments by status
  app.get('/status/:status', async (request) => {
    const params = request.params as { status: PaymentStatus }
    return controller.getPaymentsByStatus(params.status)
  })

  // Get overdue payments
  app.get('/overdue', async () => {
    return controller.getOverduePayments()
  })

  // Get pending payments
  app.get('/pending', async () => {
    return controller.getPendingPayments()
  })

  // Get payments by date range
  app.get('/date-range', async (request) => {
    const query = request.query as { startDate: string; endDate: string }
    return controller.getPaymentsByDateRange(query.startDate, query.endDate)
  })

  // Get payments by apartment and date range
  app.get('/apartment/:apartmentUnitCode/date-range', async (request) => {
    const params = request.params as { apartmentUnitCode: string }
    const query = request.query as { startDate: string; endDate: string }
    return controller.getPaymentsByApartmentAndDateRange(
      params.apartmentUnitCode,
      query.startDate,
      query.endDate,
    )
  })

  // Get payment statistics by apartment
  app.get('/apartment/:apartmentUnitCode/stats', async (request) => {
    const params = request.params as { apartmentUnitCode: string }
    return controller.getPaymentStatsByApartment(params.apartmentUnitCode)
  })

  // Get payment statistics by user
  app.get('/user/:userPhoneNumber/stats', async (request) => {
    const params = request.params as { userPhoneNumber: string }
    return controller.getPaymentStatsByUser(params.userPhoneNumber)
  })

  // Create new payment
  app.post('/', async (request) => {
    const body = request.body as CreatePaymentDto
    return controller.createPayment(body)
  })

  // Submit payment proof
  app.post('/proof', async (request) => {
    const body = request.body as SubmitPaymentProofDto
    return controller.submitPaymentProof(body)
  })

  // Validate payment
  app.post('/validate', async (request) => {
    const body = request.body as ValidatePaymentDto
    return controller.validatePayment(body)
  })

  // Update payment
  app.put('/:paymentId', async (request) => {
    const params = request.params as { paymentId: string }
    const body = request.body as UpdatePaymentDto
    return controller.updatePayment(params.paymentId, body)
  })

  // Mark overdue payments (system operation)
  app.patch('/mark-overdue', async () => {
    return controller.markOverduePayments()
  })

  // Delete payment
  app.delete('/:paymentId', async (request) => {
    const params = request.params as { paymentId: string }
    return controller.deletePayment(params.paymentId)
  })
}
