import ApartmentService from './domain/apartment/services/apartment.service'
import { PaymentService } from './domain/payment/services/payment.service'
import { PaymentRepository } from './domain/payment/repositories/payment.repository'

// Initialize services
const apartmentService = new ApartmentService()
const paymentRepository = PaymentRepository.getInstance()
const paymentService = new PaymentService(paymentRepository)

export const apartamentos = async (event: any) => {
  try {
    // Get all apartments with last payment info using domain services
    const apartmentsWithPaymentInfo = await apartmentService.getApartmentsWithLastPayment()

    // Transform to legacy format for backward compatibility
    const legacyItems = apartmentsWithPaymentInfo.map((item) => {
      const apartment = item.apartment
      const lastPayment = item.lastPayment

      return {
        PK: apartment.pkValue,
        SK: apartment.skValue,
        unidade: apartment.unitCodeValue,
        unitLabel: apartment.unitLabelValue,
        endereco: apartment.addressValue,
        status: apartment.statusValue,
        tipoAluguel: apartment.rentalTypeValue,
        aluguelBase: apartment.baseRentValue,
        taxaLimpeza: apartment.cleaningFeeValue,
        imagens: apartment.imagesValue,
        telefone: apartment.contactInfoValue?.phoneNumber,
        linkAirbnb: apartment.airbnbLinkValue,
        disponivel: apartment.isAvailableValue,
        disponivelAPartirDe: apartment.availableFromValue?.toISOString(),
        ultimo_pagamento: lastPayment?.paymentDateValue?.toISOString()?.split('T')?.[0] || null,
        criadoEm: apartment.metadataValue.createdAt.toISOString(),
        atualizadoEm: apartment.metadataValue.updatedAt.toISOString(),
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: legacyItems.sort((a, b) => a.unidade.localeCompare(b.unidade)),
        total: legacyItems.length,
      }),
    }
  } catch (error) {
    console.error('Error in apartamentos handler:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
