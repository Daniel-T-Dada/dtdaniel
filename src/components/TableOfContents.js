"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function extractHeadings(content) {
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/g;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g, ''); // Remove any nested HTML tags
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level, text, id });
    }

    return headings;
}

export default function TableOfContents({ content }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        // Extract headings from content
        const extractedHeadings = extractHeadings(content);
        setHeadings(extractedHeadings);

        // Add IDs to the actual headings in the content
        const article = document.querySelector('article');
        if (article) {
            extractedHeadings.forEach(({ text, id }) => {
                const heading = Array.from(article.querySelectorAll('h2, h3'))
                    .find(el => el.textContent.trim() === text);
                if (heading) {
                    heading.id = id;
                }
            });
        }

        // Intersection Observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' }
        );

        // Observe all headings
        document.querySelectorAll('h2, h3').forEach((heading) => {
            observer.observe(heading);
        });

        return () => observer.disconnect();
    }, [content]);

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (headings.length === 0) return null;

    return (
        <div className="relative">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed bottom-4 left-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors z-50"
                aria-label={isOpen ? 'Close table of contents' : 'Open table of contents'}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                </svg>
            </button>

            {/* Table of Contents */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="fixed left-4 top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hidden md:block"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Table of Contents
                        </h2>
                        <ul className="space-y-2">
                            {headings.map(({ level, text, id }) => (
                                <li
                                    key={id}
                                    style={{
                                        paddingLeft: `${(level - 2) * 1}rem`
                                    }}
                                >
                                    <button
                                        onClick={() => scrollToHeading(id)}
                                        className={`text-left w-full px-2 py-1 rounded-md text-sm transition-colors ${activeId === id
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                            }`}
                                    >
                                        {text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* Mobile Table of Contents */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-16 left-4 right-4 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:hidden z-50"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Table of Contents
                        </h2>
                        <ul className="space-y-2">
                            {headings.map(({ level, text, id }) => (
                                <li
                                    key={id}
                                    style={{
                                        paddingLeft: `${(level - 2) * 1}rem`
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            scrollToHeading(id);
                                            setIsOpen(false);
                                        }}
                                        className={`text-left w-full px-2 py-1 rounded-md text-sm transition-colors ${activeId === id
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                                            }`}
                                    >
                                        {text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
} 