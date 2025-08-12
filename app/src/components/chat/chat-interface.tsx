import { useState, useEffect, useCallback, useMemo } from "react";
import { IconLogout, IconShieldCheckFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { type Message } from "../../lib/chat";
import { useAutoScroll } from "../../hooks/use-auto-scroll";

import { ChatInput, EmptyState, MessageBubble } from "./chat-input";
import {
  removeLocalStorageItems,
  showSuccessToast,
  showErrorToast,
} from "../../lib/utils";
import { useRecoilValue } from "recoil";
import { ChatIdentityState } from "../../atoms/chat-identity";
import { useSocket } from "../../hooks/use-socket";

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatIdentityState = useRecoilValue(ChatIdentityState);

  const socket = useSocket();

  const [input, setInput] = useState("");

  const [isChatActive, setIsChatActive] = useState(false);
  const messagesEndRef = useAutoScroll(messages);

  const navigate = useNavigate();

  const hasMessages = messages.length > 0;

  const canSubmit = input.trim().length > 0 && isChatActive;

  const userInfo = useMemo(() => ({ name: "Current User" }), []);

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

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      socket?.emit("message", {
        chatId: chatIdentityState.targetPhantomId,
        message: userMessage,
        sender: chatIdentityState.senderPhantomId,
      });

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

  const handleExitChat = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (window.confirm("Are you sure you want to leave the chat?")) {
        try {
          showSuccessToast("Leaving chat session...", 1500);
          removeLocalStorageItems("targetPhantomId", "phantomIdentity");

          setIsChatActive(false);
          navigate("/");
        } catch (error) {
          console.error("Error leaving chat:", error);
          showErrorToast("Error leaving chat session", 1500);
        }
      }
    },
    [navigate]
  );
  useEffect(() => {
    if (
      !chatIdentityState.senderPhantomId ||
      !chatIdentityState.targetPhantomId
    ) {
      showErrorToast(
        "Chat identity not found, Please Import Identity & Choose Recipient Phantom ID",
        2000
      );
      navigate("/");
      return;
    }

    socket?.emit("create-room", {
      chatId: `${chatIdentityState.senderPhantomId}-${chatIdentityState.targetPhantomId}`,
      sender: chatIdentityState.senderPhantomId,
      receiver: chatIdentityState.targetPhantomId,
    });
  }, [chatIdentityState, socket]);

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
            onSubmit={handleMessageSubmit}
          />
        </div>
      </div>
    </div>
  );
};
