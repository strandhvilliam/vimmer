"use client";
import { motion } from "motion/react";

export function LoginTitle() {
  return (
    <div className="mb-6">
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white mb-2 font-rocgrotesk"
      >
        Login to your account
      </motion.h1>
      <motion.p
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-sm text-neutral-500 dark:text-neutral-400"
      >
        Enter your email below to login to your account
      </motion.p>
    </div>
  );
}
