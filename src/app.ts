import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Logger } from "./config/logger";
import { PhantomIdentityGenerator } from "./config/identity";
import { phantomRouter } from "./config/router";

dotenv.config();
const app = express();
const logger = new Logger("app");
const PORT = process.env.PORT || 8090;

async function initServer() {
  try {
    app.use(express.json());
    app.use(
      cors({
        origin: "*",
        methods: "*",
        allowedHeaders: "*",
      })
    );

    app.use(phantomRouter[0], phantomRouter[1]);

    app.listen(PORT, () => {
      logger.info(`PHANTOM APP SERVER LIVE ON PORT ${PORT}`);
    });

    logger.info("PHANTOM APP SERVER PROCESSES STARTED SUCCESSFULLY");
  } catch (error) {
    logger.error("PHANTOM APP SERVER PROCESSES STARTED FAILED DUE TO ", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  logger.info("PHANTOM APP SERVER PROCESSES STOPPED SUCCESSFULLY");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Gracefully shutting down...");
  process.exit(0);
});

initServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
