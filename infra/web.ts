import { backend } from "./api";
import { poolClient } from "./cognito";

const stage = $app.stage ?? "dev";
const isProd = stage === "prod";

const domain = isProd ? "imovel.charmbyte.dev" : "stg.imovel.charmbyte.dev";

console.log(`Deploying to stage: ${stage} with domain: ${domain}`);

export const web = new sst.aws.Nextjs("web", {
    path: "packages/web",
    domain,
    environment: {
        NEXT_PUBLIC_COGNITO_CLIENT_ID: poolClient.id,
        NEXT_PUBLIC_API_URL: backend.url,
    }
})