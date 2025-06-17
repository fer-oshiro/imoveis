import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

import { Example } from "@imovel/core/example";
import { apartamentos } from "./apartamentos";
import { comprovantes } from "./comprovantes";
import { img } from "./img";

const client = new DynamoDBClient();

export const handler: Handler = async (event) => {

  if (event.rawPath.startsWith("/apartamentos")) return apartamentos(event);
  if (event.rawPath.startsWith("/comprovantes")) return comprovantes(event);
  if (event.rawPath.startsWith("/img")) return img(event);

  const asd = await client.send(new ScanCommand({
    TableName: Resource.table.name,
  }));

  return {
    statusCode: 200,
    body: `${Example.hello()} Linked to ${Resource.bucket.name}. ${Resource.table.name} \n JSON: ${JSON.stringify(asd)}`,
  };
};
