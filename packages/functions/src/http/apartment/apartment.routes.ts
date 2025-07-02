import { FastifyInstance } from "fastify";
import { ApartmentController } from "./apartment.controller";
import { createApartmentDto } from "../../domain/apartment/dto/create-apartament.dto";

export async function apartmentRoutes(app: FastifyInstance) {
  const controller = new ApartmentController();

  app.get("/", async () => {
    return controller.getApartments();
  });

  app.get("/:id", async (request) => {
    const params = request.params as { id: string };
    return controller.getApartmentById(params.id);
  });

  app.post("/", async (request) => {
    const body = createApartmentDto.parse(request.body);
    return controller.createApartment(body);
  });
}
