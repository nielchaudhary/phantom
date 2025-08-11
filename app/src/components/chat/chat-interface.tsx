import { useState, useEffect, useCallback } from "react";
import { IconLogout, IconShieldCheckFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { type Message } from "../../lib/chat";
import { useAutoScroll } from "../../hooks/use-auto-scroll";

import { ChatInput, EmptyState, MessageBubble } from "./chat-input";
import { useSocket } from "../../hooks/use-socket";
import { removeLocalStorageItems } from "../../lib/utils";

/**
 * Simple Two-Person Chat Component - Handles peer-to-peer messaging
 * This component manages:
 * - Message state management between two users
 * - Real-time message display
 * - User input handling
 * - Chat session management
 */
export const ChatInterface = () => {
  const socket = useSocket();

  // Core chat state - stores all messages in the conversation
  const [messages, setMessages] = useState<Message[]>([]);

  // Current user input being typed
  const [input, setInput] = useState("");

  // Track if chat is active
  const [isChatActive, setIsChatActive] = useState(false);

  // Auto-scroll to bottom when new messages are added
  const messagesEndRef = useAutoScroll(messages);

  // Navigation hook
  const navigate = useNavigate();

  // Check if there are any messages to display
  const hasMessages = messages.length > 0;

  // Check if user can submit message
  const canSubmit = input.trim().length > 0 && isChatActive;

  // Mock user info (you can replace with actual user data)
  const userInfo = { name: "Current User" };

  /**
   * CHAT INITIALIZATION:
   * Set up the chat session when component mounts
   */
  const startChat = useCallback(() => {
    if (isChatActive) return;

    setIsChatActive(true);
  }, [isChatActive]);

  /**
   * USER INPUT SUBMISSION:
   * Handle when user sends a message
   */
  const handleInputSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const userMessage = {
        id: `msg_${Date.now()}`,
        role: "user" as const,
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      if (socket) {
        console.log("Socket connected");
        socket.emit("message", userMessage);
      }

      setTimeout(() => {
        const otherUserMessage = {
          id: `msg_${Date.now()}_other`,
          role: "client " as const,
          content: `${userMessage.content}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, otherUserMessage]);
      }, 1000 + Math.random() * 2000);
    },
    [canSubmit, input]
  );

  /**
   * CHAT EXIT:
   * Handle leaving the chat session
   */
  const handleExitChat = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (window.confirm("Are you sure you want to leave the chat?")) {
        try {
          toast.success("Leaving chat session...", {
            duration: 1500,
            style: {
              background: "black",
              color: "white",
              border: "none",
            },
            position: "top-center",
          });
          removeLocalStorageItems("targetPhantomId", "phantomIdentity");

          setIsChatActive(false);
          navigate("/");
        } catch (error) {
          console.error("Error leaving chat:", error);
          toast.error("Error leaving chat session");
        }
      }
    },
    [navigate]
  );

  // ===== SIDE EFFECTS =====

  /**
   * AUTO-START CHAT:
   * Automatically start chat when component mounts
   */
  useEffect(() => {
    if (userInfo && !isChatActive) {
      startChat();
    }
  }, [userInfo, isChatActive, startChat]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-2xl bg-black rounded-4xl shadow-2xl overflow-hidden">
      {/* Header with title and exit button */}
      <header className="bg-[#121212] text-white p-6 flex justify-between items-center border border-gray-900">
        <div className="flex items-center gap-2">
          <h2 className="text-4xl text-white font-bold">
            <IconShieldCheckFilled />
          </h2>
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
            onSubmit={handleInputSubmit}
          />
        </div>
      </div>
    </div>
  );
};
