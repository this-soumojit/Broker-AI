import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./config/db";
import env from "./config/env";
import { errorHandler } from "./middlewares/error";
import routes from "./routes";
import { swaggerSpec } from "./swagger";
import { logger } from "./utils/logger";
import { ScheduledJobService } from "./services/scheduledJobs";

const pinoLogger = pinoHttp({
  logger,
});

const app = express();
const port = 8000;

app.use(pinoLogger);
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow credentials
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a success response with 'OK' text
 *     tags:
 *       - Health check
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get("/", (_req, res) => {
  res.send("OK");
});

app.use("/api/v1", routes);

app.use(errorHandler);

// FIXME: Migrations will be written at the end
sequelize
  .sync({ alter: env.NODE_ENV === "development" })
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${env.NODE_ENV} mode`);

      // Start the payment reminder scheduler
      ScheduledJobService.startPaymentReminderScheduler();
    });
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

process.on("uncaughtException", (error) => {
  logger.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error(error);
  process.exit(1);
});
