"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AnimatedText({
  text,
  className = "",
  staggerChildren = 0.015,
  ...props
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <span className={className} suppressHydrationWarning {...props}>
        {text}
      </span>
    );
  }

  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      suppressHydrationWarning
      {...props}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          suppressHydrationWarning
        >
          {word}
          {index !== words.length - 1 && " "}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function AnimatedCharacters({
  text,
  className = "",
  staggerChildren = 0.01,
  ...props
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <span className={className} suppressHydrationWarning {...props}>
        {text}
      </span>
    );
  }

  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren, delayChildren: 0.04 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      suppressHydrationWarning
      {...props}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          suppressHydrationWarning
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
