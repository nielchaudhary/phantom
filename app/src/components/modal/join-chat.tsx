import {
  getInvite,
  getUserData,
  showErrorToast,
  showSuccessToast,
} from "../../lib/utils";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { StatefulButton } from "../ui/stateful-button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { handleFrontendError } from "../../lib/error";
import type { AxiosResponse } from "axios";
import { useSetRecoilState } from "recoil";
import { ChatCreatorState, type ChatCreator } from "../../atoms/chat-identity";

interface IInviteResponse {
  message: string;
  invite: {
    roomId: string;
    senderPhantomId: string;
    receiverPhantomId: string;
    ctime: Date;
  };
}

export default function JoinChat() {
  const navigate = useNavigate();

  const setChatCreatorState = useSetRecoilState<ChatCreator>(ChatCreatorState);

  const [chatId, setChatId] = useState<string>("");
  const [phantomId, setPhantomId] = useState<string>("");

  const handleJoinChat = async () => {
    const authToken = sessionStorage.getItem("auth_token");

    //should not happen in the first place, if it does, make the user login again
    if (!authToken) {
      showErrorToast("Please login first", 1500);
      return;
    }

    try {
      const userData = await getUserData(authToken);
      if (userData.status === 200) {
        setPhantomId(userData.data.userData.phantomId);
      }
    } catch (error) {
      console.error("Error verifying Phantom ID:", error);
      let errorMessage =
        "User Not Found, Please Login with correct Credentials.";
      handleFrontendError(error as Error, errorMessage);
    }

    try {
      const resp = (await getInvite(
        phantomId,
        chatId
      )) as AxiosResponse<IInviteResponse>;

      if (resp.status === 200) {
        showSuccessToast("Invitation Valid, Joining Chat Room", 1500);

        setChatCreatorState((prev) => {
          return {
            ...prev,
            isCreator: false,
            loggedInUser: phantomId,
            targetUser: resp.data.invite.senderPhantomId,
            roomId: resp.data.invite.roomId,
          };
        });
      }

      setTimeout(() => {
        navigate(`/chat?roomId=${resp.data.invite.roomId}`);
      }, 1500);
    } catch (error) {
      console.error("Invite verification failed:", error);
      let errorMessage =
        "Invite verification failed, please check Chat Room ID and Phantom ID again.";

      handleFrontendError(error as Error, errorMessage);
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
              value={chatId}
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
