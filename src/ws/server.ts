import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Logger } from "../config/logger";
import { addInviteToDB, Invite } from "../config/utils";

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

  socket.on(
    "create-room",
    async ({ roomId, senderPhantomId, receiverPhantomId }) => {
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

      await addInviteToDB(invite);

      logger.info("Invite Added to DB!", invite);

      io.to(roomId).emit("room-created", { roomId, creator: senderPhantomId });
    }
  );

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    logger.info(`User ${username} joined room with ID: ${roomId}`);

    io.to(roomId).emit("user-joined", { roomId, username });
  });

  socket.on("message", ({ chatId, message, sender }) => {
    logger.info(
      `Message from ${sender} in ${chatId}: ${JSON.stringify(message)}`
    );

    // send only to the room (excluding sender)
    socket.to(chatId).emit("message", { sender, message });
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected with ID: ${socket.id}`);
  });
});

server.listen(8091, () => {
  logger.info(`Phantom WS SERVER LIVE ON PORT 8091`);
});
