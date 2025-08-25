import swaggerJsdoc from "swagger-jsdoc";

import env from "./config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mitra API",
      version: "1.0.0",
      description: "API documentation for Mitra application",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: env.SWAGGER.HOST,
        description: `${env.NODE_ENV} server`,
      },
    ],
  },
  apis: ["./src/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
