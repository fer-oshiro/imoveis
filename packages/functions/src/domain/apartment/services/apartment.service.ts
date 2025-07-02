import PaymentRepository from "../../payment/repositories/payment.repository";
import ApartmentRepository from "../repositories/apartment.repository";

export default class ApartmentService {
  private apartmentRepository: ApartmentRepository;

  constructor() {
    this.apartmentRepository = ApartmentRepository.getInstance();
  }

  async getApartments() {
    const apartments = await this.apartmentRepository.getApartments();
    const lastPayment = await Promise.all(
      apartments.map(async (apartment: any) => {
        const paymentRepository = PaymentRepository.getInstance();
        if (!apartment.telefone) return null;
        const pk = "USER#" + apartment.telefone.match(/\d+/g)?.join("");
        const lastPayment = await paymentRepository.getLastPayments(pk);
        console.log(lastPayment);
        return lastPayment?.dataDeposito ?? null;
      })
    );

    apartments?.forEach((item, index) => {
      item.last_payment = lastPayment[index] || null;
    });

    return apartments.sort((a, b) => a.unidade.localeCompare(b.unidade));
  }

  async createApartment(apartmentData: any) {
    const apartment = await this.apartmentRepository.createApartment(
      apartmentData
    );
    return apartment;
  }
}
