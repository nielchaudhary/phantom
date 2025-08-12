"use client";
import { motion } from "framer-motion";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState } from "react";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { useModal } from "../../hooks/use-modal";
import { MnemonicInput } from "../ui/mnemonic";
import { useNavigate } from "react-router-dom";
import {
  showSuccessToast,
  showErrorToast,
  generateIdentity,
  getIdentity,
  isAxiosError,
  verifyUserExists,
  type ApiErrorResponse,
} from "../../lib/utils";
import JoinChat from "../modal/join-chat";
import type { GenerateIdentityResponse } from "../modal/generate-identity";
import GenerateIdentity from "../modal/generate-identity";
import { useSetRecoilState } from "recoil";
import { ChatIdentityState, type ChatIdentity } from "../../atoms/identity";
import { LoginState } from "../../atoms/login";

export default function HeroSection() {
  const navigate = useNavigate();

  const setChatIdentityState =
    useSetRecoilState<ChatIdentity>(ChatIdentityState);

  const [identity, setIdentity] = useState<GenerateIdentityResponse>({
    mnemonic: [],
    phantomId: "",
  });

  const [importMnemonic, setImportMnemonic] = useState<string[]>([]);
  const [targetPhantomId, setTargetPhantomId] = useState<string>("");

  const setLoginState = useSetRecoilState(LoginState);

  const [activeModal, setActiveModal] = useState<
    "generate" | "import" | "create-chat" | "join-chat"
  >("generate");

  const { setOpen } = useModal();

  const handleJoinPhantom = async () => {
    try {
      const resp = await generateIdentity();
      setIdentity(resp.data);
      setActiveModal("generate");

      // Open modal after a delay to allow for button animation
      setTimeout(() => {
        setOpen(true);
      }, 1000);
      showSuccessToast("Identity Generated Successfully", 1000);
    } catch (error) {
      console.error("Identity Generation Failed", error);
      showErrorToast(
        "Identity Generation Failed, Please Refresh the Page",
        1500
      );
    }
  };

  const handleImportClick = () => {
    setActiveModal("import");
    setOpen(true);
  };

  const handleImportUserIdentity = async () => {
    if (!importMnemonic) {
      showErrorToast("Please enter a valid mnemonic phrase", 1500);
      return;
    }

    try {
      const resp = await getIdentity(importMnemonic);
      if (resp.status === 200) {
        const data = resp.data as { identity: GenerateIdentityResponse };
        localStorage.setItem("phantomIdentity", JSON.stringify(data.identity));
        showSuccessToast(`Welcome Back, ${data.identity.phantomId}`, 1500);

        setLoginState({ phantomId: data.identity.phantomId });

        setTimeout(() => {
          setIdentity(data.identity);
          setActiveModal("create-chat");
        }, 2000);
      } else {
        const errorMessage =
          (resp.data as ApiErrorResponse)?.error ||
          "Something went wrong, Please check mnemonic phrase again.";
        showErrorToast(errorMessage, 1500);
      }
    } catch (error) {
      console.error("Identity verification failed:", error);
      let errorMessage =
        "Identity verification failed, please check mnemonic phrase";

      if (isAxiosError<ApiErrorResponse>(error)) {
        errorMessage =
          error.response?.data?.error || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showErrorToast(errorMessage, 1500);
    }
  };

  const handleInviteToChat = async () => {
    if (!targetPhantomId.trim()) {
      showErrorToast("Please enter a valid Phantom ID", 1500);
      return;
    }

    const phantomId = localStorage.getItem("phantomIdentity");

    if (!phantomId) {
      showErrorToast("Please Import Your Identity", 1500);
      return;
    }

    if (identity.phantomId === targetPhantomId.trim()) {
      showErrorToast("Please Enter a different Phantom ID", 1500);
      return;
    }

    try {
      const resp = await verifyUserExists(targetPhantomId.trim());

      if (resp.status === 200) {
        localStorage.setItem("targetPhantomId", targetPhantomId.trim());
        showSuccessToast("Validated User Details, Redirecting . . .", 1500);

        setChatIdentityState({
          senderPhantomId: identity.phantomId,
          targetPhantomId: targetPhantomId.trim(),
        });

        setTimeout(() => {
          setOpen(false);
          navigate("/chat", {
            state: {
              identity: identity,
              targetPhantomId: targetPhantomId.trim(),
            },
          });
        }, 2000);
      } else {
        const errorMessage =
          (resp.data as ApiErrorResponse)?.error ||
          "Something went wrong, Please Check Phantom ID again.";
        showErrorToast(errorMessage, 1500);
      }
    } catch (error) {
      console.error("Error verifying Phantom ID:", error);
      let errorMessage = "User Not Found, Please Check Phantom ID again.";

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
            onClick={handleImportClick}
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
            <div className="flex flex-row gap-6">
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
