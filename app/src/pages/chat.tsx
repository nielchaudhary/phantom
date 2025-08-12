import { ChatInterface } from "../components/chat/chat-interface";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SocketProvider from "../context/socket";
import { showErrorToast } from "../lib/utils";

export default function Chat() {
  const navigate = useNavigate();

  useEffect(() => {
    const phantomIdentity = localStorage.getItem("phantomIdentity");
    const targetPhantomId = localStorage.getItem("targetPhantomId");
    if (!phantomIdentity || !targetPhantomId) {
      showErrorToast(
        "Please Import Your Identity and Add Recipient Phantom ID",
        1500
      );
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
