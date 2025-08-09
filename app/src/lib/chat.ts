export interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

export const createMessage = (content: string, id?: string): Message => ({
  id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  content,
  timestamp: new Date(),
});
