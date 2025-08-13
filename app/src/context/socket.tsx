import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { SocketContext } from "../hooks/use-socket";
import { useRecoilValue } from "recoil";
import { ChatCreatorState } from "../atoms/chat-identity";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const chatCreatorState = useRecoilValue(ChatCreatorState);

  useEffect(() => {
    if (chatCreatorState.isCreator) {
      const newSocket = io("http://localhost:8091");
      setSocket(newSocket);
    }

    return () => {
      socket?.disconnect();
    }; // Cleanup on unmount
  }, [chatCreatorState]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
