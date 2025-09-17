import { PaymentService } from './domain/payment/services/payment.service'
import { PaymentRepository } from './domain/payment/repositories/payment.repository'

// Initialize services
const paymentRepository = PaymentRepository.getInstance()
const paymentService = new PaymentService(paymentRepository)

export const comprovantes = async (event: any) => {
  try {
    if (event.requestContext.http.method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      console.log('Received body:', body)

      // Validate date format using domain service
      const dataDeposito = body.dataDeposito
      if (!dataDeposito) {
        throw new Error('dataDeposito is required')
      }
      if (dataDeposito.startsWith('T')) {
        throw new Error('Invalid date format')
      }
      if (dataDeposito.split('T')[1]?.length !== 13) {
        throw new Error('Invalid time format')
      }

      const date = new Date(dataDeposito)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }

      // Submit payment proof using domain service
      await paymentService.submitLegacyPaymentProof(body)

      return {
        statusCode: 200,
        body: 'success',
      }
    }

    // GET request - get all payment proofs using domain service
    const paymentProofs = await paymentService.getAllPaymentProofs()

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: paymentProofs.sort((a, b) => a.unidade.localeCompare(b.unidade)),
        total: paymentProofs.length,
      }),
    }
  } catch (error) {
    console.error('Error in comprovantes handler:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
