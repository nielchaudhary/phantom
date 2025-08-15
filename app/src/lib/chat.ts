export interface Message {
  id: string;
  content: string;
  role: "user" | "client";
  timestamp: Date;
}

export const createMessage = (
  content: string,
  role: "user" | "client",
  id?: string
): Message => ({
  id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  content,
  role,
  timestamp: new Date(),
});
