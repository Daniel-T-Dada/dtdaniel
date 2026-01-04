"use client";

import { useState } from 'react';

interface YouTubeEmbedProps {
    videoId: string;
    title?: string;
}

export default function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <svg
                            className="w-10 h-10 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Loading video...
                        </span>
                    </div>
                </div>
            )}
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={title || 'YouTube video player'}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
            />
        </div>
    );
}
