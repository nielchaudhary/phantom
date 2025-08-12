"use client";
import { motion } from "framer-motion";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState } from "react";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { useModal } from "../../hooks/use-modal";
import { MnemonicInput } from "../ui/mnemonic";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  generateIdentity,
  getIdentity,
  isAxiosError,
  Status,
  updateUserStatus,
  verifyExistsAndStatus,
  type ApiErrorResponse,
} from "../../lib/utils";
import JoinChat from "../modal/join-chat";
import type { GenerateIdentityResponse } from "../modal/generate-identity";
import GenerateIdentity from "../modal/generate-identity";

export default function HeroSection() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<GenerateIdentityResponse>({
    mnemonic: [],
    phantomId: "",
  });

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

      // Open modal after a delay to allow for button animation
      setTimeout(() => {
        setOpen(true);
      }, 1000);
      toast.success("Identity Generated Successfully");
    } catch (error) {
      console.error("Identity Generation Failed", error);
      toast.error("Identity Generation Failed, Please Refresh the Page");
    }
  };

  const handleImportClick = () => {
    setActiveModal("import");
    setOpen(true);
  };

  const handleImportUserIdentity = async () => {
    if (!importMnemonic) {
      toast.error("Please enter a valid mnemonic phrase", {
        position: "top-center",
      });
      return;
    }

    try {
      const resp = await getIdentity(importMnemonic);
      if (resp.status === 200) {
        const data = resp.data as { identity: GenerateIdentityResponse };
        localStorage.setItem("phantomIdentity", JSON.stringify(data.identity));
        toast.success(`Welcome Back, ${data.identity.phantomId}`, {
          duration: 1500,
          style: {
            background: "black",
            color: "white",
            border: "none",
          },
          position: "top-center",
        });

        setTimeout(() => {
          setIdentity(data.identity);
          setActiveModal("create-chat");
        }, 2000);

        // Update user status after successful identity import
        try {
          await updateUserStatus(data.identity.phantomId, Status.ONLINE);
        } catch (error) {
          console.error("Update Status failed:", error);
          toast.error("Update Status failed, Please Refresh the Page", {
            position: "top-center",
          });
        }
      } else {
        const errorMessage =
          (resp.data as ApiErrorResponse)?.error ||
          "Something went wrong, Please check mnemonic phrase again.";
        toast.error(errorMessage, {
          position: "top-center",
        });
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

      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  };

  const handleInviteToChat = async () => {
    if (!targetPhantomId.trim()) {
      toast.error("Please enter a valid Phantom ID", {
        position: "top-center",
      });
      return;
    }

    const phantomId = localStorage.getItem("phantomIdentity");

    if (!phantomId) {
      toast.error("Please Import Your Identity", {
        position: "top-center",
      });
      return;
    }

    if (identity.phantomId === targetPhantomId.trim()) {
      toast.error("Please Enter a different Phantom ID", {
        position: "top-center",
      });
      return;
    }

    try {
      const resp = await verifyExistsAndStatus(targetPhantomId.trim());

      if (resp.status === 200) {
        localStorage.setItem("targetPhantomId", targetPhantomId.trim());
        toast.success("Valid user, redirecting to chat", {
          duration: 1500,
          style: {
            background: "black",
            color: "white",
            border: "none",
          },
          position: "top-center",
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
        toast.error(errorMessage, {
          position: "top-center",
        });
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

      toast.error(errorMessage, {
        position: "top-center",
      });
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
