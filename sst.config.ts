/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "imovel",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    await import("./infra/dynamo");
    const cognito = await import("./infra/cognito");
    const storage = await import("./infra/storage");
    const api = await import("./infra/api");
    await import("./infra/web");

    return {
      MyBucket: storage.bucket.name,
      MyCognitoUserPool: cognito.poolClient.id,
      Api: api.myApi.url
    };
  },
});
