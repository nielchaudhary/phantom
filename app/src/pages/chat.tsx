import { ChatInterface } from "../components/chat/chat-interface";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import SocketProvider from "../context/socket";

export default function Chat() {
  const navigate = useNavigate();

  useEffect(() => {
    const phantomIdentity = localStorage.getItem("phantomIdentity");
    const targetPhantomId = localStorage.getItem("targetPhantomId");
    if (!phantomIdentity || !targetPhantomId) {
      toast.error("Please Import Your Identity and Add Recipient Phantom ID", {
        position: "top-center",
        style: {
          background: "black",
          color: "white",
          border: "none",
        },
      });
      navigate("/");
    }
  });

  const phantomIdentity = localStorage.getItem("phantomIdentity");
  const targetPhantomId = localStorage.getItem("targetPhantomId");

  if (!phantomIdentity || !targetPhantomId) {
    return null;
  }

  return (
    <SocketProvider>
      <div className="w-full flex justify-center items-start pt-10 pb-4 px-4 min-h-screen home-page-bg">
        <ChatInterface />
      </div>
    </SocketProvider>
  );
}
