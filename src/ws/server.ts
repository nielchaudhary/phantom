import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Logger } from "../config/logger";
import { addInviteToDB, Invite } from "../config/utils";
import { initDB } from "../config/db";

const logger = new Logger("ws-server");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  },
});

const roomUsers = new Map<string, Set<string>>();

async function startServer() {
  try {
    await initDB();
    logger.info("Phantom DB Initialised on WS Server");

    io.on("connection", (socket) => {
      logger.info(`New Connection Established with ID: ${socket.id}`);

      // Handle room creation (creator joins automatically)
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

            // track the creator in the room
            if (!roomUsers.has(roomId)) {
              roomUsers.set(roomId, new Set());
            }
            roomUsers.get(roomId)!.add(senderPhantomId);

            // store user info in socket for cleanup
            socket.data = { roomId, phantomId: senderPhantomId };

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

            // notify the creator that room was created successfully
            socket.emit("room-created", {
              roomId,
              creator: senderPhantomId,
            });
          } catch (error) {
            logger.error("Error in create-room handler:", error);
            socket.emit("error", { message: "Failed to create room" });
          }
        }
      );

      // handle joining a room (for non-creators)
      socket.on("join-room", ({ roomId, phantomId }) => {
        try {
          if (!roomId || !phantomId) {
            logger.error("missing required parameters for joining room", {
              roomId,
              phantomId,
            });
            socket.emit("error", { message: "missing required parameters" });
            return;
          }

          socket.join(roomId);

          if (!roomUsers.has(roomId)) {
            roomUsers.set(roomId, new Set());
          }
          roomUsers.get(roomId)!.add(phantomId);

          socket.data = { roomId, phantomId };

          logger.info(`User ${phantomId} joined room with ID: ${roomId}`);

          // notify all users in room that someone joined
          io.to(roomId).emit("user-joined", {
            roomId,
            phantomId,
            usersInRoom: Array.from(roomUsers.get(roomId) || []),
          });

          socket.emit("joined-room", {
            roomId,
            phantomId,
            usersInRoom: Array.from(roomUsers.get(roomId) || []),
          });
        } catch (error) {
          logger.error("Error in join-room handler:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      // message handling
      socket.on(
        "send-message",
        ({ roomId, senderId, receiverId, content, timestamp, messageId }) => {
          try {
            if (!roomId || !senderId || !content) {
              logger.error("missing required parameters for message", {
                roomId,
                senderId,
                content,
              });
              socket.emit("error", { message: "missing required parameters" });
              return;
            }

            logger.info(`Message from ${senderId} in ${roomId}: ${content}`);

            // Send to all other users in the room (not the sender)
            socket.to(roomId).emit("new-message", {
              id: messageId || `msg_${Date.now()}`,
              senderId,
              receiverId,
              content,
              timestamp: timestamp || new Date(),
              roomId,
            });
          } catch (error) {
            logger.error("Error in send-message handler:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      socket.on("leave-room", ({ roomId, phantomId }) => {
        try {
          socket.leave(roomId);

          if (roomUsers.has(roomId)) {
            roomUsers.get(roomId)!.delete(phantomId);

            // clean up empty room
            if (roomUsers.get(roomId)!.size === 0) {
              roomUsers.delete(roomId);
            }
          }

          logger.info(`User ${phantomId} left room ${roomId}`);

          socket.to(roomId).emit("user-left", {
            roomId,
            phantomId,
            usersInRoom: Array.from(roomUsers.get(roomId) || []),
          });
        } catch (error) {
          logger.error("Error in leave-room handler:", error);
        }
      });

      socket.on("disconnect", () => {
        try {
          const userData = socket.data;
          if (userData?.roomId && userData?.phantomId) {
            if (roomUsers.has(userData.roomId)) {
              roomUsers.get(userData.roomId)!.delete(userData.phantomId);

              if (roomUsers.get(userData.roomId)!.size === 0) {
                roomUsers.delete(userData.roomId);
              }
            }

            socket.to(userData.roomId).emit("user-left", {
              roomId: userData.roomId,
              phantomId: userData.phantomId,
              usersInRoom: Array.from(roomUsers.get(userData.roomId) || []),
            });

            logger.info(
              `User ${userData.phantomId} disconnected from room ${userData.roomId}`
            );
          }

          logger.info(`User disconnected with ID: ${socket.id}`);
        } catch (error) {
          logger.error("Error in disconnect handler:", error);
        }
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
