"use client";
import { motion } from "motion/react";
import { PhantomCometCard } from "../ui/comet-card";
import { StatefulButton } from "../ui/stateful-button";
import { useState, useEffect } from "react";
import { type PhantomIdentity } from "../../types";
import axios from "axios";
import { ModalBody, ModalContent, ModalFooter } from "../ui/animated-modal"; // Adjust import path as needed
import { useModal } from "../../hooks/use-modal";

export default function HeroSection() {
  const [identity, setIdentity] = useState<PhantomIdentity>({
    privateKey: "",
    publicKey: "",
    phantomId: "",
  });
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const { setOpen } = useModal(); // Get modal control from context

  const handleClick = async () => {
    const resp = await axios.post(
      "http://localhost:8090/v1/generate-identity",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = resp.data;
    setIdentity(data.identity);

    // Trigger modal opening after button animation completes + 1 second delay
    setShouldOpenModal(true);
  };

  // Open modal when identity is set and after delay
  useEffect(() => {
    if (
      shouldOpenModal &&
      identity.privateKey &&
      identity.publicKey &&
      identity.phantomId
    ) {
      const timer = setTimeout(() => {
        setOpen(true);
        setShouldOpenModal(false); // Reset the trigger
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [identity]);

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
          <button className="w-60 transform rounded-lg bg-white px-3 py-2 text-sm border border-zinc-700 text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-black cursor-pointer rounded-xl leading-7 font-sans">
            I have an account
          </button>
        </motion.div>
      </div>

      <ModalBody>
        <ModalContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Phantom ID
                </label>
                <div className="p-3 border border-zinc-700 text-white rounded-lg font-mono text-sm break-all mb-5">
                  {identity.phantomId}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Public Key
                </label>
                <div className="p-3 border border-zinc-700 text-white rounded-lg font-mono text-sm break-all mb-5">
                  {identity.publicKey}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Private Key
                </label>
                <div className="p-3 border border-zinc-700 text-white rounded-lg font-mono text-sm break-all mb-5">
                  {identity.privateKey}
                </div>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <StatefulButton
            className="w-50 transform rounded-lg bg-black px-3 py-2 text-sm border border-zinc-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-700 cursor-pointer rounded-xl text-white leading-7 font-sans"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(identity, null, 2));
            }}
          >
            Copy to Clipboard
          </StatefulButton>
        </ModalFooter>
      </ModalBody>
    </div>
  );
}
