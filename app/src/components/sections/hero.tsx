"use client";
import { motion } from "motion/react";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState } from "react";
import axios from "axios";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal";
import { useModal } from "../../hooks/use-modal";
import Mnemonic, { MnemonicInput } from "../ui/mnemonic";
import { toast } from "sonner";

interface GenerateIdentityResponse {
  mnemonic: string[];
  phantomId: string;
}

export default function HeroSection() {
  const [identity, setIdentity] = useState<GenerateIdentityResponse>({
    mnemonic: [],
    phantomId: "",
  });

  const [importMnemonic, setImportMnemonic] = useState<string[]>([]);

  const [activeModal, setActiveModal] = useState<"generate" | "import">(
    "generate"
  );

  const { setOpen } = useModal();

  const handleClick = async () => {
    try {
      const resp = await axios.post(
        "http://localhost:8090/v1/generate-identity",
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

  const handleVerifyMnemonic = async () => {
    try {
      const resp = await axios.post(
        "http://localhost:8090/v1/get-identity",
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
            color: "white", // or '#ccc' for a lighter gray
            border: "none",
          },
          position: "top-center",
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Identity verification failed, please check mnemonic phrase");
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
            className="w-60 transform rounded-lg bg-black px-3 py-2 text-sm border border-zinc-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-700 cursor-pointer rounded-xl text-white leading-7 font-sans"
            onClick={handleClick}
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
              className="w-50 transform rounded-lg bg-black px-3 py-2 text-sm border border-zinc-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-700 cursor-pointer rounded-xl text-white leading-7 font-sans"
              onClick={() => {
                navigator.clipboard.writeText(identity.mnemonic.join(" "));
              }}
            >
              Copy to Clipboard
            </StatefulButton>
          </ModalFooter>
        </ModalBody>
      ) : (
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
              className="w-50 transform rounded-lg bg-black px-3 py-2 text-sm border border-zinc-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-700 cursor-pointer rounded-xl text-white leading-7 font-sans"
              onClick={handleVerifyMnemonic}
            >
              Import
            </StatefulButton>
          </ModalFooter>
        </ModalBody>
      )}
    </div>
  );
}
