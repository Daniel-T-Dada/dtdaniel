"use client";

import { useEffect, useState, RefObject } from "react";
import { useInView, UseInViewOptions } from "framer-motion";

export default function useScrollAnimation(ref: RefObject<Element | null>, options: UseInViewOptions = {}) {
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
