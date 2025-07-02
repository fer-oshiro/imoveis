import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

import { Example } from "@imovel/core/example";
import { apartamentos } from "./apartamentos";
import { comprovantes } from "./comprovantes";
import { img } from "./img";
import { test } from "./test";

// const client = new DynamoDBClient();

// export const handler: Handler = async (event) => {

//   if (event.rawPath.startsWith("/apartamentos")) return apartamentos(event);
//   if (event.rawPath.startsWith("/comprovantes")) return comprovantes(event);
//   if (event.rawPath.startsWith("/img")) return img(event);
//   if (event.rawPath.startsWith("/test")) return test();

//   const asd = await client.send(new ScanCommand({
//     TableName: Resource.table.name,
//   }));

//   return {
//     statusCode: 200,
//     body: `${Example.hello()} Linked to ${Resource.bucket.name}. ${Resource.table.name} \n JSON: ${JSON.stringify(asd)}`,
//   };
// };


import { app } from './app'
import { awsLambdaFastify } from '@fastify/aws-lambda'

const proxy = awsLambdaFastify(app)

export const handler = async (event: any, context: any) => {

  if (event.rawPath.startsWith("/apartamentos")) return apartamentos(event);
  if (event.rawPath.startsWith("/comprovantes")) return comprovantes(event);
  if (event.rawPath.startsWith("/img")) return img(event);
  if (event.rawPath.startsWith("/test")) return test();

  return proxy(event, context)
}