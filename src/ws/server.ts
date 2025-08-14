import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Logger } from "../config/logger";
import { addInviteToDB, Invite } from "../config/utils";
import { initDB } from "../config/db";

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

async function startServer() {
  try {
    await initDB();
    logger.info("Phantom DB Initialised on WS Server");

    io.on("connection", (socket) => {
      logger.info(`New Connection Established with ID: ${socket.id}`);

      socket.on(
        "create-room",
        async ({ roomId, senderPhantomId, receiverPhantomId }) => {
          try {
            if (!roomId || !senderPhantomId || !receiverPhantomId) {
              logger.error("Missing required parameters for room creation", {
                roomId,
                senderPhantomId,
                receiverPhantomId,
              });
              socket.emit("error", { message: "Missing required parameters" });
              return;
            }

            socket.join(roomId);
            logger.info(
              `Room Created with ID: ${roomId} by ${senderPhantomId}, receiver: ${receiverPhantomId}`
            );

            const invite: Invite = {
              roomId,
              senderPhantomId,
              receiverPhantomId,
              ctime: new Date(),
            };

            const result = await addInviteToDB(invite);

            logger.info("Invite successfully added to DB!", { invite, result });

            io.to(roomId).emit("room-created", {
              roomId,
              creator: senderPhantomId,
            });
          } catch (error) {
            logger.error("Error in create-room handler:", error);
            socket.emit("error", { message: "Failed to create room" });
          }
        }
      );

      socket.on("join-room", ({ roomId, username }) => {
        try {
          socket.join(roomId);
          logger.info(`User ${username} joined room with ID: ${roomId}`);

          io.to(roomId).emit("user-joined", { roomId, username });
        } catch (error) {
          logger.error("Error in join-room handler:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      socket.on("message", ({ chatId, message, sender }) => {
        try {
          logger.info(
            `Message from ${sender} in ${chatId}: ${JSON.stringify(message)}`
          );

          socket.to(chatId).emit("message", { sender, message });
        } catch (error) {
          logger.error("Error in message handler:", error);
        }
      });

      socket.on("disconnect", () => {
        logger.info(`User disconnected with ID: ${socket.id}`);
      });
    });

    const PORT = process.env.PORT || 8091;
    server.listen(PORT, () => {
      logger.info(`Phantom WS SERVER LIVE ON PORT ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
