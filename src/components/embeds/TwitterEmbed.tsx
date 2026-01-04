"use client";

import { useState, useEffect } from 'react';

interface TwitterEmbedProps {
    tweetId: string;
}

export default function TwitterEmbed({ tweetId }: TwitterEmbedProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load Twitter widget script
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="relative w-full min-h-[300px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <svg
                            className="w-10 h-10 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Loading tweet...
                        </span>
                    </div>
                </div>
            )}
            <blockquote
                className="twitter-tweet"
                data-theme="dark"
                onLoad={() => setIsLoaded(true)}
            >
                <a href={`https://twitter.com/i/status/${tweetId}`}></a>
            </blockquote>
        </div>
    );
}
