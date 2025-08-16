const devURL = "http://localhost:8090";
const prodURL = "https://phantom-18fu.onrender.com";

export const PHANTOM_API_URL =
  import.meta.env.MODE === "production" ? prodURL : devURL;

export interface IUserJoinedData {
  roomId: string;
  phantomId: string;
  usersInRoom: string[];
}

export interface IIncomingMessageData {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  roomId: string;
}
