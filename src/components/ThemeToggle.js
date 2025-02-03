"use client";

import { useTheme } from "./Providers";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 360 : 0,
          scale: theme === "dark" ? 0.9 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative w-5 h-5"
      >
        {theme === "dark" ? (
          <MoonIcon className="w-5 h-5 text-indigo-400 absolute top-0 left-0" />
        ) : (
          <SunIcon className="w-5 h-5 text-indigo-600 absolute top-0 left-0" />
        )}
      </motion.div>
    </motion.button>
  );
}
