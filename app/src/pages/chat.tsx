import { ChatInterface } from "../components/chat/chat-interface";

export default function Chat() {
  return (
    <>
      <div className="w-full flex justify-center items-start pt-10 pb-4 px-4 min-h-screen home-page-bg">
        <ChatInterface />
      </div>
    </>
  );
}
