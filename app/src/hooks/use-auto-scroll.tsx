import type { Message } from "../lib/chat";
import { useEffect, useRef } from "react";

export const useAutoScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return messagesEndRef;
};
