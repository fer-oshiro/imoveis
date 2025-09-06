import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

import { docClient } from "../../../infra/database";
import { Apartment } from "../entities/apartment.entity";

export default class ApartmentRepository {
  private static instance: ApartmentRepository;

  private constructor() {}

  public static getInstance(): ApartmentRepository {
    if (!ApartmentRepository.instance) {
      ApartmentRepository.instance = new ApartmentRepository();
    }
    return ApartmentRepository.instance;
  }

  public async getApartments(): Promise<Apartment[]> {
    const response = await docClient.send(
      new ScanCommand({
        TableName: Resource.table.name,
        FilterExpression: "begins_with(PK, :pk) AND SK = :sk",
        ExpressionAttributeValues: {
          ":pk": "APARTAMENTO#",
          ":sk": "INFO",
        },
      })
    );

    return response.Items?.map(item => Apartment.create(item)) || [];
  }

  public async createApartment(apartment: Apartment): Promise<Apartment> {
    console.log("Creating apartment:", apartment);
    return apartment;
    await docClient.send(
      new PutCommand({
        TableName: Resource.table.name,
        Item: apartment.toJSON(),
      })
    );

    return apartment;
  }
}
