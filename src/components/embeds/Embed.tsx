"use client";

import { parseEmbed } from '@/utils/embedParser';
import YouTubeEmbed from './YouTubeEmbed';
import TwitterEmbed from './TwitterEmbed';
import InstagramEmbed from './InstagramEmbed';

interface EmbedProps {
    url: string;
}

export default function Embed({ url }: EmbedProps) {
    const embeds = parseEmbed(url); // parseEmbed returns array of parts
    // Embed component seems designed to handle a single URL that IS an embed, 
    // but parseEmbed allows text + embeds.
    // However, looking at the original Embed.js:
    // const { type, id, error } = parseEmbed(url);
    // It implies the old parseEmbed (or embedUtils) returned a single object.
    // My migrated `embedParser` returns `EmbedPart[]`.

    // I need to adapt the logic or check if I should use a different utility.
    // The original `Embed.js` used `parseEmbed` from `@/utils/embedUtils`.
    // My migrated `embedParser` is more complex (returns fragments).
    // Let's create a helper to extract the first embed info if it exists, matching the old behavior if possible.
    // Or better, let's look at `embedParser.ts` again.

    // Actually, `embedParser.ts` exports `parseEmbed` which returns `EmbedPart[]`.
    // If the original `Embed.js` expected `{ type, id, error }`, then `embedUtils.js` (which I might not have seen yet) 
    // likely had a different signature.

    // I'll search for `embedUtils.js` first before locking this in.
    // But assuming I need to stick to the new `embedParser`:

    const embedPart = embeds.find(p => p.type === 'embed') as any;

    if (!embedPart) {
        return (
            <div className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to embed content: Invalid URL or not an embeddable link
                </p>
            </div>
        );
    }

    const { embedType, id } = embedPart;

    switch (embedType) {
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
