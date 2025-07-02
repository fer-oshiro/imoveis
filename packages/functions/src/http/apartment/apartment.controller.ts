import ApartmentService from "../../domain/apartment/services/apartment.service";

export class ApartmentController {
  private apartmentService: ApartmentService;

  constructor() {
    this.apartmentService = new ApartmentService();
  }
  async getApartments() {
    const response = await this.apartmentService.getApartments();
    return response;
  }

  async getApartmentById(id: string) {
    return {
      id,
      name: `Apartment ${id}`,
      location: `Location ${id}`,
      price: 1000 + parseInt(id, 10) * 500,
    };
  }

  async createApartment(apartmentData: any) {
    return this.apartmentService.createApartment(apartmentData);
  }
}
