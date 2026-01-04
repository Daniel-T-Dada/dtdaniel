"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { useState, useEffect } from "react";

// Explicitly define what we accept to strictly control props passed to DOM
interface AnimatedTextProps extends Omit<HTMLMotionProps<"span">, "style" | "onDrag" | "onDragStart" | "onDragEnd"> {
    text: string;
    className?: string;
    staggerChildren?: number;
    // Allow style explicitly if needed, but type it loosely or correctly for both
    style?: React.CSSProperties;
}

export default function AnimatedText({
    text,
    className = "",
    staggerChildren = 0.015,
    style,
    ...props
}: AnimatedTextProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter out motion-specific props for the fallback span
    const {
        variants: _v,
        transition: _t,
        initial: _i,
        animate: _a,
        ...domProps
    } = props as any;

    if (!isMounted) {
        return (
            <span
                className={className}
                style={style}
                suppressHydrationWarning
                {...domProps}
            >
                {text}
            </span>
        );
    }

    const words = text.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren, delayChildren: 0.04 * i },
        }),
    };

    const child: Variants = {
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
            style={style as any} // Cast if needed for motion style compat
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

interface AnimatedCharactersProps extends Omit<HTMLMotionProps<"span">, "style" | "onDrag" | "onDragStart" | "onDragEnd"> {
    text: string;
    className?: string;
    staggerChildren?: number;
    style?: React.CSSProperties;
}

export function AnimatedCharacters({
    text,
    className = "",
    staggerChildren = 0.01,
    style,
    ...props
}: AnimatedCharactersProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        variants: _v,
        transition: _t,
        initial: _i,
        animate: _a,
        ...domProps
    } = props as any;

    if (!isMounted) {
        return (
            <span
                className={className}
                style={style}
                suppressHydrationWarning
                {...domProps}
            >
                {text}
            </span>
        );
    }

    const letters = Array.from(text);

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren, delayChildren: 0.04 },
        },
    };

    const child: Variants = {
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
            style={style as any}
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
