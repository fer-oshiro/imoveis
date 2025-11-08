import { Apartment } from '@imovel/core/domain/apartment'

export interface ApartmentRepository {
  findById(id: string): Promise<Apartment | null>
  save(apartment: Apartment): Promise<void>
  delete(apartment: Apartment): Promise<void>
}
