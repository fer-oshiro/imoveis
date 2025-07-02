import { DynamoDBClient, } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const comprovantes = async (event: any) => {
    if (event.requestContext.http.method === "POST") {
        const body = JSON.parse(event.body || "{}");
        const response = await docClient.send(new PutCommand({
            TableName: Resource.table.name,
            Item: body
        }));

        if (response.$metadata.httpStatusCode !== 200) {
            console.error("Failed to put item:", response);
            return {
                statusCode: 500,
                body: "Failed to put item",
            };
        }
        return {
            statusCode: 200,
            body: "success",
        };
    }


    const response = await docClient.send(new ScanCommand({
        TableName: Resource.table.name,
        FilterExpression: "begins_with(SK, :sk) AND tipo = :tipo",
        ExpressionAttributeValues: {
            ":sk": "COMPROVANTE#",
            ":tipo": "comprovante",
        },
    }));



    return {
        statusCode: 200,
        body: JSON.stringify({
            items: response.Items?.sort((a, b) => a.unidade.localeCompare(b.unidade)) || [],
            total: response.Count,
        }),
    };
};