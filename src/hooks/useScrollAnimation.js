"use client";

import { useEffect, useState } from "react";
import { useInView } from "framer-motion";

export default function useScrollAnimation(ref, options = {}) {
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
    ...options,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return false during SSR to prevent hydration mismatch
  if (!mounted) return false;

  return isInView;
}
