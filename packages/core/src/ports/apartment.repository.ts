import { Apartment } from '@imovel/core/domain/apartment'

export interface ApartmentRepository {
  findById(id: string): Promise<Apartment | null>
  findAll(): Promise<Apartment[]>
  save(apartment: Apartment): Promise<void>
  delete(apartment: Apartment): Promise<void>
}
