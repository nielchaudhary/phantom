import { ChatInterface } from "../components/chat/chat-interface";
import SocketProvider from "../context/socket";

export default function Chat() {
  return (
    <SocketProvider>
      <div className="w-full flex justify-center items-start pt-10 pb-4 px-4 min-h-screen home-page-bg">
        <ChatInterface />
      </div>
    </SocketProvider>
  );
}
