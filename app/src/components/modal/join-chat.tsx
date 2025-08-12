import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { StatefulButton } from "../ui/stateful-button";

export default function JoinChat() {
  return (
    <ModalBody>
      <ModalContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-[60%] max-w-md">
            <input
              type="text"
              placeholder="Enter Chat Room ID"
              className="w-full px-4 py-2 text-sm border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-center -mb-12"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <StatefulButton className="stateful-button max-w-[40%] -mt-6">
          Join Chat
        </StatefulButton>
      </ModalFooter>
    </ModalBody>
  );
}
