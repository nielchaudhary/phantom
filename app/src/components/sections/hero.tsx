"use client";
import { motion } from "framer-motion";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState } from "react";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { useModal } from "../../hooks/use-modal";
import { MnemonicInput } from "../ui/mnemonic";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import {
  showSuccessToast,
  showErrorToast,
  generateIdentity,
  authenticateUser,
  type authenticateUserResponse,
  fetchPhantomUser,
  getUserData,
} from "../../lib/utils";
import JoinChat from "../modal/join-chat";
import type { GenerateIdentityResponse } from "../modal/generate-identity";
import GenerateIdentity from "../modal/generate-identity";

import { handleFrontendError } from "../../lib/error";
import { useSetRecoilState } from "recoil";
import { ChatCreatorState, type ChatCreator } from "../../atoms/chat-identity";

export default function HeroSection() {
  const navigate = useNavigate();

  const [identity, setIdentity] = useState<GenerateIdentityResponse>({
    mnemonic: [],
    phantomId: "",
  });

  const setChatCreatorState = useSetRecoilState<ChatCreator>(ChatCreatorState);

  const [importMnemonic, setImportMnemonic] = useState<string[]>([]);
  const [targetPhantomId, setTargetPhantomId] = useState<string>("");

  const [activeModal, setActiveModal] = useState<
    "generate" | "import" | "create-chat" | "join-chat"
  >("generate");

  const { setOpen } = useModal();

  const handleJoinPhantom = async () => {
    try {
      const resp = await generateIdentity();
      setIdentity(resp.data);
      setActiveModal("generate");

      setOpen(true);
      showSuccessToast("Identity Generated Successfully", 1000);
    } catch (error) {
      console.error("Identity Generation Failed", error);
      showErrorToast(
        "Identity Generation Failed, Please Refresh the Page",
        1500
      );
    }
  };

  const handleImportUserIdentity = async () => {
    if (!importMnemonic) {
      showErrorToast("Please enter a valid mnemonic phrase", 1500);
      return;
    }

    try {
      const resp = await authenticateUser(importMnemonic);
      if (resp.status === 200) {
        const data = resp.data as authenticateUserResponse;

        showSuccessToast(`Welcome Back, ${data.userData.phantomId}`, 1500);
        setIdentity({
          mnemonic: [],
          phantomId: data.userData.phantomId,
        });

        sessionStorage.setItem("auth_token", data.userData.jwtToken);

        setActiveModal("create-chat");
      }
    } catch (error) {
      console.error("Identity verification failed:", error);
      handleFrontendError(
        error as Error,
        "Identity verification failed, please check mnemonic phrase"
      );
    }
  };

  const handleInviteToChat = async () => {
    if (!targetPhantomId.trim()) {
      showErrorToast("Please enter a valid Phantom ID", 1500);
      return;
    }

    if (!sessionStorage.getItem("auth_token")) {
      showErrorToast("Please login first", 1500);
      setActiveModal("import");
      return;
    }

    try {
      const resp = await fetchPhantomUser(
        targetPhantomId.trim(),
        sessionStorage.getItem("auth_token") as string
      );

      if (resp.status === 200) {
        showSuccessToast("Validated User Details, Redirecting . . .", 500);

        const roomId = nanoid();

        setChatCreatorState({
          isCreator: true,
          loggedInUser: identity.phantomId,
          targetUser: targetPhantomId.trim(),
          roomId,
        });

        setOpen(false);
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (error) {
      console.error("Error verifying Phantom ID:", error);
      const errorMessage = "User Not Found, Please Check Phantom ID again.";
      handleFrontendError(error as Error, errorMessage);
    }
  };

  const handleExistingUser = async () => {
    if (sessionStorage.getItem("auth_token")) {
      try {
        const resp = await getUserData(
          sessionStorage.getItem("auth_token") as string
        );

        if (resp.status === 200) {
          showSuccessToast(
            `Welcome Back, ${resp.data.userData.phantomId}`,
            1500
          );
          setIdentity({
            mnemonic: [],
            phantomId: resp.data.userData.phantomId,
          });
          setChatCreatorState({
            isCreator: false,
            loggedInUser: resp.data.userData.phantomId,
            targetUser: "",
            roomId: "",
          });

          setActiveModal("create-chat");
          setOpen(true);
        }
      } catch (error) {
        console.error("Error verifying Phantom ID:", error);
        const errorMessage =
          "User Not Found, Please Login with correct Credentials.";
        handleFrontendError(error as Error, errorMessage);
        setActiveModal("import");
      }
    } else {
      setActiveModal("import");
      setOpen(true);
    }
  };

  return (
    <div className="relative w-full my-5 mt-10 mb-10 flex max-w-3xl flex-col items-center justify-center">
      <div className="mt-10 z-10">
        <PhantomCometCard />
      </div>
      <div className="px-4 py-5 md:py-10">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-4"
        >
          <StatefulButton
            className="stateful-button"
            onClick={handleJoinPhantom}
          >
            Join Phantom
          </StatefulButton>
          <button
            className="w-60 transform rounded-lg bg-white px-3 py-2 text-sm border border-zinc-700 text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-black cursor-pointer rounded-xl leading-7 font-sans"
            onClick={handleExistingUser}
          >
            I have an account
          </button>
        </motion.div>
      </div>

      {/* Modal with Conditional Content */}
      {activeModal === "generate" ? (
        <GenerateIdentity identity={identity} />
      ) : activeModal === "import" ? (
        <ModalBody>
          <ModalContent>
            <div className="flex flex-col items-center justify-center p-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-white font-bold mb-8">
                  Enter Your Mnemonic Phrase
                </label>
              </div>

              <div className="w-full max-w-md">
                <MnemonicInput
                  mnemonic={importMnemonic}
                  onChange={setImportMnemonic}
                />
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <StatefulButton
              className="stateful-button"
              onClick={handleImportUserIdentity}
            >
              Import
            </StatefulButton>
          </ModalFooter>
        </ModalBody>
      ) : activeModal === "create-chat" ? (
        <ModalBody>
          <ModalContent>
            <div className="flex flex-col items-center justify-center p-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-white font-bold mb-6 text-center">
                  Enter Recipient Phantom ID
                </label>
              </div>

              <div className="w-full max-w-md">
                <input
                  type="text"
                  value={targetPhantomId}
                  onChange={(e) => setTargetPhantomId(e.target.value)}
                  placeholder="Enter Phantom ID"
                  className="w-full px-4 py-2 text-sm border border-zinc-700 bg-zinc-800 text-white rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-center"
                />
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <div className="flex justify-center flex-row gap-4 max-w-[90%]">
              <button className="stateful-button" onClick={handleInviteToChat}>
                Invite to Chat
              </button>
              <button
                className="stateful-button"
                onClick={() => {
                  setActiveModal("join-chat");
                }}
              >
                Join Chat Room
              </button>
            </div>
          </ModalFooter>
        </ModalBody>
      ) : (
        <JoinChat />
      )}
    </div>
  );
}
