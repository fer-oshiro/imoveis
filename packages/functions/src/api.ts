import { img } from './img'

// const client = new DynamoDBClient();

// export const handler: Handler = async (event) => {

//   if (event.rawPath.startsWith("/img")) return img(event);
//   if (event.rawPath.startsWith("/test")) return test();

//   const asd = await client.send(new ScanCommand({
//     TableName: Resource.UserTable.name,
//   }));

//   return {
//     statusCode: 200,
//     body: `${Example.hello()} Linked to ${Resource.bucket.name}. ${Resource.UserTable.name} \n JSON: ${JSON.stringify(asd)}`,
//   };
// };

import { app } from './app'
import { awsLambdaFastify } from '@fastify/aws-lambda'

const proxy = awsLambdaFastify(app)

export const handler = async (event: any, context: any) => {
  if (event.rawPath.startsWith('/img')) return img(event)
  return proxy(event, context)
}
