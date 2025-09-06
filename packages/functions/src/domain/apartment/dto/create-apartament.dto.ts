import { z } from "zod";

export const Status = z.enum([
  "occupied",
  "available",
  "maintenance",
  "reserved",
  "inactive"
]);
export const RentalSource = z.enum(["direct", "agency_managed", "airbnb"]);

export const createApartmentDto = z.object({
  unitCode: z.string(),
  status: Status.default("available"),
  rentalSource: RentalSource.default("direct"),
  baseRent: z.string().optional(),
  cleaningFee: z.string().optional().optional(),
  primaryResident: z.string().optional(),
  mainTenant: z.string().optional(),
  cpf: z.string().optional(),
  hasCleaningService: z.boolean().optional(),
  waterIncluded: z.boolean().optional(),
  electricityIncluded: z.boolean().optional(),
  contactPhone: z.string().optional(),
  contactMethod: z.string().optional(),
  updateAt: z.string().optional(),
  createdAt: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateApartmentDto = z.infer<typeof createApartmentDto>;
export type ApartmentStatusType = z.infer<typeof Status>;
export type RentalSourceType = z.infer<typeof RentalSource>;
