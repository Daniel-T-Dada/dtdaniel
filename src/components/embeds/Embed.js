'use client';

import { parseEmbed } from '@/utils/embedUtils';
import YouTubeEmbed from './YouTubeEmbed';
import TwitterEmbed from './TwitterEmbed';
import InstagramEmbed from './InstagramEmbed';

export default function Embed({ url }) {
    const { type, id, error } = parseEmbed(url);

    if (error) {
        return (
            <div className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to embed content: {error}
                </p>
            </div>
        );
    }

    switch (type) {
        case 'youtube':
            return <YouTubeEmbed videoId={id} />;
        case 'twitter':
            return <TwitterEmbed tweetId={id} />;
        case 'instagram':
            return <InstagramEmbed postId={id} />;
        default:
            return (
                <div className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Unsupported embed type
                    </p>
                </div>
            );
    }
} 