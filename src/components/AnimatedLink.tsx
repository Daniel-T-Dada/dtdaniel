"use client";

import Link, { LinkProps } from "next/link";
import { motion, HTMLMotionProps } from "framer-motion";
import { useState, useEffect, ReactNode } from "react";

// Define strict prop types to avoid intersection issues
interface AnimatedLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    external?: boolean;
    // Allow standard anchor attributes strictly
    target?: string;
    rel?: string;
    title?: string;
    id?: string;
    role?: string;
    tabIndex?: number;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    // Add any other specific anchor props needed
}

export default function AnimatedLink({
    href,
    children,
    className = "",
    external = false,
    ...props
}: AnimatedLinkProps) {
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
        // Render standard elements without motion props during server/hydration
        // Ensure strictly only valid DOM props are passed
        if (external) {
            return (
                <a
                    href={href.toString()}
                    className={className}
                    {...props}
                >
                    {children}
                </a>
            );
        }
        return (
            <Link
                href={href}
                className={className}
                {...props}
            >
                {children}
            </Link>
        );
    }

    // motion(Link) produces a type incompatible with Next.js Link's generic constraints;
    // casting via unknown is the only safe workaround without patching upstream types.
    const MotionLink = motion(Link) as unknown as React.ComponentType<React.ComponentProps<typeof Link> & { whileHover?: object; whileTap?: object; transition?: object }>;
    const MotionA = motion.a;

    if (external) {
        return (
            <MotionA href={href.toString()} className={className} {...animation} {...props}>
                {children}
            </MotionA>
        );
    }

    return (
        <MotionLink href={href} className={className} {...animation} {...props}>
            {children}
        </MotionLink>
    );
}

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    // Explicitly allow disabled as it's common
    disabled?: boolean;
}

export function AnimatedButton({
    onClick,
    children,
    className = "",
    disabled = false,
    ...props
}: AnimatedButtonProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR fallback render, only pass safe native props
    if (!mounted) {
        return (
            <button onClick={onClick} className={className} disabled={disabled}>
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
