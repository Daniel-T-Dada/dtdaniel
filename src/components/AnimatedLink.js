"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AnimatedLink({
  href,
  children,
  className = "",
  external = false,
  ...props
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animation = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  };

  if (!mounted) {
    return external ? (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    ) : (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }

  const Component = external ? motion.a : motion(Link);

  return (
    <Component href={href} className={className} {...animation} {...props}>
      {children}
    </Component>
  );
}

export function AnimatedButton({
  onClick,
  children,
  className = "",
  disabled = false,
  ...props
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={className}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
