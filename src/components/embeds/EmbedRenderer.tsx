"use client";

import { parseEmbed } from '@/utils/embedParser';
import YouTubeEmbed from './YouTubeEmbed';
import TwitterEmbed from './TwitterEmbed';
import InstagramEmbed from './InstagramEmbed';

interface EmbedRendererProps {
    url: string;
}

export default function EmbedRenderer({ url }: EmbedRendererProps) {
    const embeds = parseEmbed(url);
    const embedPart = embeds.find(p => p.type === 'embed') as any;

    if (!embedPart) {
        return (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to embed content: Invalid URL
                </p>
            </div>
        );
    }

    switch (embedPart.embedType) {
        case 'youtube':
            return <YouTubeEmbed videoId={embedPart.id} />;
        case 'twitter':
            return <TwitterEmbed tweetId={embedPart.id} />;
        case 'instagram':
            return <InstagramEmbed postId={embedPart.id} />;
        default:
            return (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Unsupported embed type
                    </p>
                </div>
            );
    }
}
