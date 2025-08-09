import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish";

/**
 * INPUT COMPONENT
 * Handles user input with dynamic placeholders and submit functionality
 *
 * Features:
 * - Dynamic placeholder text based on interview state
 * - Form submission handling
 * - Disabled state management during thinking/loading
 * - Integration with custom PlaceholdersAndVanishInput component
 */
export const ChatInput = ({
  input,
  setInput,
  onSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => {
  const placeholders = ["Send your secure message . . ."];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] p-4">
      <div className="flex ">
        <div className="flex-1 relative">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            value={input}
            setValue={setInput}
          />
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = ({
  message,
}: {
  message: {
    content: string;
    timestamp: Date;
    role?: "user" | "client";
  };
}) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Profile picture placeholder */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden ${
            isUser ? "ml-3" : "mr-3"
          } bg-gray-600`}
        >
          {isUser ? (
            <img
              src="/user_img.png"
              alt="Your profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Client profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col">
          {/* Sender name */}
          <div
            className={`text-xs mb-1 ${
              isUser ? "text-right" : "text-left"
            } text-gray-400`}
          >
            {/*manage through the global
            state later on */}
            {isUser ? "You" : "Phantom-1231381831"}{" "}
          </div>

          {/* Message bubble */}
          <div
            className={`relative rounded-lg px-4 py-2 border ${
              isUser
                ? "border-zinc-800 rounded-xl bg-black"
                : "border-zinc-800 rounded-xl bg-black"
            }`}
          >
            <div className="whitespace-pre-wrap text-gray-200 text-sm font-semibold">
              {message.content}
            </div>

            {/* Timestamp */}
            <div
              className={`text-xs mt-1 ${
                isUser ? "text-blue-400" : "text-gray-500"
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmptyState = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4 max-w-md">
      <p className="text-zinc-900/20 text-sm px-10 py-2 border border-zinc-800 rounded-xl">
        Start typing to begin the chat
      </p>
    </div>
  </div>
);
