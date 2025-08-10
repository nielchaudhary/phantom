"use client";
import { motion } from "framer-motion";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState } from "react";
import axios from "axios";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { useModal } from "../../hooks/use-modal";
import Mnemonic, { MnemonicInput } from "../ui/mnemonic";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PHANTOM_API_URL } from "../../lib/constants";
import { verifyPhantomIdExists } from "../../lib/utils";

interface GenerateIdentityResponse {
  /**
   * A 12-word BIP39 mnemonic phrase, used for generating a key pair.
   * The mnemonic is used to generate a private key and a public key,
   * which are then used to create a Phantom identity.
   */
  mnemonic: string[];
  phantomId: string;
}

export default function HeroSection() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<GenerateIdentityResponse>({
    mnemonic: [],
    phantomId: "",
  });

  const [importMnemonic, setImportMnemonic] = useState<string[]>([]);
  const [targetPhantomId, setTargetPhantomId] = useState<string>("");

  const [activeModal, setActiveModal] = useState<
    "generate" | "import" | "chat"
  >("generate");

  const { setOpen } = useModal();

  const handleJoinPhantom = async () => {
    try {
      const resp = await axios.post(
        PHANTOM_API_URL + "/phantom/v1/generate-identity",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = resp.data;
      setIdentity(data);
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
    try {
      const resp = await axios.post(
        PHANTOM_API_URL + "/phantom/v1/get-identity",
        {
          mnemonic: importMnemonic,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.status === 200) {
        const data = resp.data;
        toast.info(`Welcome Back, ${data.identity.phantomId}`, {
          duration: 5000,
          style: {
            background: "black",
            color: "white",
            border: "none",
          },
          position: "top-center",
        });

        setIdentity(data.identity);

        localStorage.setItem("phantomIdentity", JSON.stringify(data.identity));

        setActiveModal("chat");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Identity verification failed, please check mnemonic phrase");
    }
  };

  const handleInviteToChat = async () => {
    if (!targetPhantomId.trim()) {
      toast.error("Please enter a valid Phantom ID", {
        position: "top-center",
      });
      return;
    }

    try {
      const resp = await verifyPhantomIdExists(targetPhantomId.trim());
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
      } else if (resp.status === 404) {
        toast.error("User Not Found, Please Check Phantom ID again.", {
          position: "top-center",
        });
      } else {
        toast.error("Something went wrong, Please Check Phantom ID again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error verifying Phantom ID:", error);
      toast.error("User Not Found, Please Check Phantom ID again.", {
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
        <ModalBody>
          <ModalContent>
            <div className="flex flex-col items-center justify-center p-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-red-500 font-bold mb-8 text-center">
                  Store this mnemonic phrase in a safe place, it will be used to
                  log into the phantom app
                </label>
                <label className="flex justify-center items-center gap-2 text-sm text-gray-300 mb-2 text-center">
                  Phantom ID will be used as your public ID to interact with
                  users
                </label>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-white mb-8 border border-zinc-700 p-2 rounded-lg font-semibold">
                  Phantom ID : {identity.phantomId}
                </p>
              </div>

              <div className="w-full max-w-md">
                {identity.mnemonic.length > 0 && (
                  <Mnemonic mnemonic={identity.mnemonic} />
                )}
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <StatefulButton
              className="stateful-button"
              onClick={() => {
                navigator.clipboard.writeText(identity.mnemonic.join(" "));
              }}
            >
              Copy to Clipboard
            </StatefulButton>
          </ModalFooter>
        </ModalBody>
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
      ) : (
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
            <button className="stateful-button" onClick={handleInviteToChat}>
              Invite to Chat
            </button>
          </ModalFooter>
        </ModalBody>
      )}
    </div>
  );
}
