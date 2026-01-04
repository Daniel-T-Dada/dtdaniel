"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";
import { auth, ADMIN_EMAIL } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const navigation = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Projects", href: "/projects" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setIsAdmin(!!user && user.email === ADMIN_EMAIL);
        });
        return () => unsubscribe();
    }, []);

    // Return a simplified navbar or nothing during SSR to prevent hydration mismatch if necessary,
    // but usually for SEO we want links.
    // The specific mismatch was likely due to ThemeToggle or Admin link.
    // Admin link is guarded by isAdmin (default false), so that matches SSR (false).
    // ThemeToggle might be the culprit. We should render it only when mounted.

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                        >
                            Double D
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        <div className="flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {mounted && isAdmin && (
                                <Link
                                    href="/admin"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                        {/* ThemeToggle usually depends on local storage, so only render when mounted */}
                        {mounted && <ThemeToggle />}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-4 md:hidden">
                        {mounted && <ThemeToggle />}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {mounted && isAdmin && (
                            <Link
                                href="/admin"
                                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
