import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Logger } from "../config/logger";

const logger = new Logger("Phantom WS SERVER");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  },
});

io.on("connection", (socket) => {
  logger.info(`New Connection Established with ID: ${socket.id}`);
  socket.on("message", (message: string) => {
    logger.info(
      `Message received from ${socket.id}: ${JSON.stringify(message)}`
    );
  });
  socket.on("disconnect", () => {
    logger.info(`User disconnected with ID: ${socket.id}`);
  });
});

server.listen(8091, () => {
  logger.info(`Phantom WS SERVER LIVE ON PORT 8091`);
});
