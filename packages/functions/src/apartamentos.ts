import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const apartamentos = async (event: any) => {
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

  const ultimoComprovante = response.Items?.map(async (item) => {
    if (!item.telefone) return null;
    const pk = "USER#" + item.telefone.match(/\d+/g)?.join("");
    const response = await docClient.send(
      new QueryCommand({
        TableName: Resource.table.name,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":skPrefix": "COMPROVANTE#",
        },
        ScanIndexForward: false,
        Limit: 1,
      })
    );
    if (response.Items && response.Items.length > 0) {
      return response.Items[0];
    }
    return null;
  }) || [];

  const comprovante = await Promise.all(ultimoComprovante);

  response.Items?.forEach((item, index) => {
    item.ultimo_pagamento =
      (comprovante[index] as any)?.dataDeposito?.split("T")?.[0] || null;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      items:
        response.Items?.sort((a, b) => a.unidade.localeCompare(b.unidade)) ||
        [],
      total: response.Count,
    }),
  };
};
