export const swaggerOptions = {
  swagger: {
    info: {
      title: 'Imoveis API',
      description: `Swagger documentation for Imoveis API`,
      version: '1.0.0',
    },
    host: `localhost:${process.env.PORT || 3000}`,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
}

export const swaggerUiOptions = {
  routePrefix: '/docs',
}
