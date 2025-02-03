"use client";

import { motion } from "framer-motion";

export default function Blob({ className }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        className="relative w-[500px] h-[500px] filter blur-[80px] opacity-30 dark:opacity-20"
      >
        <div className="absolute inset-0 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply" />
        <div className="absolute inset-0 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply translate-x-10 translate-y-10" />
        <div className="absolute inset-0 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply -translate-x-10" />
      </motion.div>
    </div>
  );
}
