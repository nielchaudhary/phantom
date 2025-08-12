import { getInvite, showErrorToast, showSuccessToast } from "../../lib/utils";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { StatefulButton } from "../ui/stateful-button";
import { useNavigate } from "react-router-dom";
import type { ApiErrorResponse } from "../../lib/utils";
import { isAxiosError } from "axios";
import { useRecoilValue } from "recoil";
import { LoginState } from "../../atoms/login";
import { useState } from "react";

export default function JoinChat() {
  const navigate = useNavigate();

  const loginState = useRecoilValue(LoginState);

  const [chatId, setChatId] = useState<string>("");

  const handleJoinChat = async () => {
    try {
      const resp = await getInvite(loginState.phantomId, chatId);
      if (resp.status === 200) {
        showSuccessToast("Invitation Valid, Joining Chat Room", 1500);

        setTimeout(() => {
          navigate("/chat");
        }, 2000);
      } else {
        const errorMessage =
          (resp.data as ApiErrorResponse)?.error ||
          "Something went wrong, Please check Chat Room ID and Phantom ID again.";
        showErrorToast(errorMessage, 1500);
      }
    } catch (error) {
      console.error("Invite verification failed:", error);
      let errorMessage =
        "Invite verification failed, please check Chat Room ID and Phantom ID again.";

      if (isAxiosError<ApiErrorResponse>(error)) {
        errorMessage =
          error.response?.data?.error || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showErrorToast(errorMessage, 1500);
    }
  };
  return (
    <ModalBody>
      <ModalContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-[60%] max-w-md">
            <input
              type="text"
              placeholder="Enter Chat Room ID"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setChatId(e.target.value)
              }
              className="w-full px-4 py-2 text-sm border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-center -mb-12"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <StatefulButton
          className="stateful-button max-w-[40%] -mt-6"
          onClick={handleJoinChat}
        >
          Join Chat
        </StatefulButton>
      </ModalFooter>
    </ModalBody>
  );
}
