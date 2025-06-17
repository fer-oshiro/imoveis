export const UserTable = new sst.aws.Dynamo("table", {
    fields: {
        PK: "string",
        SK: "string",
        name: "string",
        unidade: "string",
        status: "string",
        updatedAt: "string",
    },
    primaryIndex: {
        hashKey: "PK",
        rangeKey: "SK",
    },
    globalIndexes: {
        UnidadeIndex: {
            hashKey: "unidade",
            rangeKey: "status",
        },
        NomeIndex: {
            hashKey: "name",
            rangeKey: "updatedAt"
        },
    },
});