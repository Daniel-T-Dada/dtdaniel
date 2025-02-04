"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const defaultAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  scaleInHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
};

export default function AnimatedElement({
  children,
  animation = "fadeIn",
  duration = 0.5,
  delay = 0,
  className = "",
  hover = false,
  ...props
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and initial client render, return a div with no animations
  if (!isMounted) {
    return (
      <div className={className} suppressHydrationWarning {...props}>
        {children}
      </div>
    );
  }

  const animationConfig = defaultAnimations[animation];
  const hoverConfig = hover ? defaultAnimations.scaleInHover : {};

  return (
    <motion.div
      {...animationConfig}
      {...hoverConfig}
      transition={{ duration, delay }}
      className={className}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </motion.div>
  );
}
