"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { useState, useEffect, ReactNode } from "react";

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

export type AnimationType = keyof typeof defaultAnimations;

interface AnimatedElementProps extends Omit<HTMLMotionProps<"div">, "children" | "style" | "onDrag" | "onDragStart" | "onDragEnd"> {
    children: ReactNode;
    animation?: AnimationType;
    duration?: number;
    delay?: number;
    className?: string;
    hover?: boolean;
    style?: React.CSSProperties;
}

export default function AnimatedElement({
    children,
    animation = "fadeIn",
    duration = 0.5,
    delay = 0,
    className = "",
    hover = false,
    style,
    ...props
}: AnimatedElementProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter motion props for fallback
    const {
        variants: _v,
        transition: _t,
        initial: _i,
        animate: _a,
        ...domProps
    } = props as any;

    // During SSR and initial client render, return a div with no animations
    if (!isMounted) {
        return (
            <div
                className={className}
                style={style}
                suppressHydrationWarning
                {...domProps}
            >
                {children}
            </div>
        );
    }

    const animationConfig = defaultAnimations[animation as keyof typeof defaultAnimations] || defaultAnimations.fadeIn;
    const hoverConfig = hover ? defaultAnimations.scaleInHover : {};

    return (
        <motion.div
            {...animationConfig}
            {...hoverConfig}
            transition={{ duration, delay }}
            className={className}
            style={style as any}
            suppressHydrationWarning
            {...props}
        >
            {children}
        </motion.div>
    );
}
