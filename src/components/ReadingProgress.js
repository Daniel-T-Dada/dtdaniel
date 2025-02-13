'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function calculateReadingTime(content) {
    // Strip HTML tags and count words
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200; // Average reading speed
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

export default function ReadingProgress({ content }) {
    const [progress, setProgress] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        // Calculate reading time
        const time = calculateReadingTime(content);
        setReadingTime(time);

        // Get stored progress
        const storedProgress = localStorage.getItem(`reading-progress-${window.location.pathname}`);
        if (storedProgress) {
            const scrollPosition = (parseFloat(storedProgress) / 100) * getDocumentHeight();
            window.scrollTo(0, scrollPosition);
        }

        function getDocumentHeight() {
            const body = document.body;
            const html = document.documentElement;
            return Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
        }

        function calculateProgress() {
            const windowHeight = window.innerHeight;
            const documentHeight = getDocumentHeight();
            const scrollTop = window.scrollY;
            const scrollHeight = documentHeight - windowHeight;
            const currentProgress = (scrollTop / scrollHeight) * 100;

            setProgress(Math.min(100, Math.max(0, currentProgress)));
            setShowScrollTop(scrollTop > windowHeight);

            // Store progress
            localStorage.setItem(
                `reading-progress-${window.location.pathname}`,
                currentProgress.toString()
            );
        }

        // Add scroll event listener
        window.addEventListener('scroll', calculateProgress);
        calculateProgress(); // Initial calculation

        return () => window.removeEventListener('scroll', calculateProgress);
    }, [content]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
                <motion.div
                    className="h-full bg-indigo-600 dark:bg-indigo-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Reading Time */}
            <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-xs font-medium shadow-md z-50">
                {readingTime} min read
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={scrollToTop}
                    className="fixed bottom-4 right-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors z-50"
                    aria-label="Scroll to top"
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
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </motion.button>
            )}
        </>
    );
} 