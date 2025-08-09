import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { SocketContext } from "../hooks/use-socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8091");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    }; // Cleanup on unmount
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
