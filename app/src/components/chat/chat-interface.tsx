import { useState, useEffect, useCallback, useRef } from "react";
import { IconLogout, IconShieldCheckFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { type Message } from "../../lib/chat";
import { useAutoScroll } from "../../hooks/use-auto-scroll";

import { ChatInput, EmptyState, MessageBubble } from "./chat-input";
import { showSuccessToast, showErrorToast } from "../../lib/utils";
import { useSocket } from "../../hooks/use-socket";
import { useRecoilValue } from "recoil";
import { ChatCreatorState, type ChatCreator } from "../../atoms/chat-identity";

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useSocket();
  const chatCreatorState = useRecoilValue<ChatCreator>(ChatCreatorState);
  const messagesEndRef = useAutoScroll(messages);
  const navigate = useNavigate();

  const roomCreatedRef = useRef(false);
  const roomJoinedRef = useRef(false);

  const hasMessages = messages.length > 0;
  const canSubmit = input.trim().length > 0 && isChatActive && isConnected;

  const startChat = useCallback(() => {
    if (isChatActive) return;
    setIsChatActive(true);
  }, [isChatActive]);

  const handleMessageSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const userMessage = {
        id: `msg_${Date.now()}`,
        role: "user" as const,
        content: input.trim(),
        timestamp: new Date(),
      };

      //optimistic update
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      if (socket && chatCreatorState.roomId) {
        socket.emit("send-message", {
          roomId: chatCreatorState.roomId,
          senderId: chatCreatorState.loggedInUser,
          receiverId: chatCreatorState.targetUser,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
          messageId: userMessage.id,
        });
      }
    },
    [canSubmit, input, socket, chatCreatorState]
  );

  const handleExitChat = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (window.confirm("Are you sure you want to leave the chat?")) {
        try {
          // Emit leave room event
          if (
            socket &&
            chatCreatorState.roomId &&
            chatCreatorState.loggedInUser
          ) {
            socket.emit("leave-room", {
              roomId: chatCreatorState.roomId,
              phantomId: chatCreatorState.loggedInUser,
            });
          }

          showSuccessToast("Leaving chat session...", 1500);
          setIsChatActive(false);
          navigate("/");
        } catch (error) {
          console.error("Error leaving chat:", error);
          showErrorToast("Error leaving chat session", 1500);
        }
      }
    },
    [navigate, socket, chatCreatorState]
  );

  // room creation (for creators)
  useEffect(() => {
    if (
      chatCreatorState.isCreator &&
      chatCreatorState.roomId &&
      socket &&
      !roomCreatedRef.current
    ) {
      socket.emit("create-room", {
        roomId: chatCreatorState.roomId,
        senderPhantomId: chatCreatorState.loggedInUser,
        receiverPhantomId: chatCreatorState.targetUser,
      });
      roomCreatedRef.current = true;
    }
  }, [chatCreatorState, socket]);

  // room joining (for non-creators)
  useEffect(() => {
    if (
      !chatCreatorState.isCreator &&
      chatCreatorState.roomId &&
      socket &&
      !roomJoinedRef.current
    ) {
      socket.emit("join-room", {
        roomId: chatCreatorState.roomId,
        phantomId: chatCreatorState.loggedInUser,
      });
      roomJoinedRef.current = true;
    }
  }, [chatCreatorState, socket]);

  // socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error("Socket error:", error);
      showErrorToast(error.message || "Connection error", 1500);
    };

    const handleRoomCreated = () => {
      showSuccessToast("Chat room created successfully", 1500);
    };

    const handleJoinedRoom = () => {
      showSuccessToast("Successfully joined chat room", 1500);
    };

    const handleUserJoined = (data: any) => {
      if (data.phantomId !== chatCreatorState.loggedInUser) {
        showSuccessToast(`${data.phantomId} joined the chat`, 1500);
      }
    };

    const handleUserLeft = (data: any) => {
      if (data.phantomId !== chatCreatorState.loggedInUser) {
        showErrorToast(`${data.phantomId} left the chat`, 1500);
      }
    };

    const handleIncomingMessage = (messageData: any) => {
      const incomingMessage: Message = {
        id: messageData.id || `msg_${Date.now()}`,
        role:
          messageData.senderId === chatCreatorState.loggedInUser
            ? "user"
            : "client",
        content: messageData.content,
        timestamp: new Date(messageData.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, incomingMessage]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("room-created", handleRoomCreated);
    socket.on("joined-room", handleJoinedRoom);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("new-message", handleIncomingMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("room-created", handleRoomCreated);
      socket.off("joined-room", handleJoinedRoom);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("new-message", handleIncomingMessage);
    };
  }, [socket, chatCreatorState.loggedInUser]);

  useEffect(() => {
    if (!isChatActive) {
      startChat();
    }
  }, [isChatActive, startChat]);

  // reset room flags when chat creator state changes
  useEffect(() => {
    roomCreatedRef.current = false;
    roomJoinedRef.current = false;
  }, [chatCreatorState.roomId]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-2xl bg-black rounded-4xl shadow-2xl overflow-hidden">
      {/* Header with title and exit button */}
      <header className="bg-[#121212] text-white p-6 flex justify-between items-center border border-gray-900">
        <div className="flex items-center gap-2">
          <h2 className="text-4xl text-white font-bold">
            <IconShieldCheckFilled />
          </h2>
          {/* Connection status indicator */}
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          />
        </div>
        <button
          className="group/btn relative flex items-center justify-center shadow-input w-40 h-10 rounded-xl font-semibold bg-black border-transparent text-white text-sm dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer"
          onClick={handleExitChat}
        >
          <span className="flex items-center">
            <IconLogout className="w-4 h-4 mr-1.5" />
            Leave Chat
          </span>
        </button>
      </header>

      {/* Main chat area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full flex flex-col bg-[#121212] border border-[#2A2A2A] rounded-xl">
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-4 bg-black">
            {!hasMessages ? (
              <EmptyState />
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble message={message} key={index} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleMessageSubmit}
          />
        </div>
      </div>
    </div>
  );
};
