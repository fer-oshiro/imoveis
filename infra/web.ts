import { backend } from "./api";
import { poolClient } from "./cognito";

export const web = new sst.aws.Nextjs("web", {
    path: "packages/web",
    domain: 'imovel.charmbyte.dev',
    environment: {
        NEXT_PUBLIC_COGNITO_CLIENT_ID: poolClient.id,
        NEXT_PUBLIC_API_URL: backend.url,
    }
})