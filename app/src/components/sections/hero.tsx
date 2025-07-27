"use client";

import { motion } from "motion/react";
import { PhantomCometCard } from "../ui/comet-card";

export default function HeroSection() {
  return (
    <div className="relative w-full my-5 mt-10 mb-10 flex max-w-3xl flex-col items-center justify-center">
      <div className="mt-10 z-10">
        <PhantomCometCard />
      </div>

      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-t from-transparent via-green-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute bottom-0 h-40 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 top-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute right-0 h-px w-40 bg-gradient-to-l from-transparent via-green-500 to-transparent" />
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
          <button className="w-60 transform rounded-lg bg-black px-3 py-2 text-sm border border-zinc-700 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-black dark:text-gray-200 dark:hover:bg-zinc-700 cursor-pointer rounded-xl text-white leading-7 font-sans">
            Join Phantom
          </button>
          <button className="w-60 transform rounded-lg bg-white px-3 py-2 text-sm border border-zinc-700 text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-black cursor-pointer rounded-xl leading-7 font-sans">
            I have an account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
