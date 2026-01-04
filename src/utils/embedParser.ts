import { TextFragment } from './processCodeBlocks';

export interface EmbedFragment {
    type: 'embed';
    embedType: 'youtube' | 'twitter' | 'instagram';
    id: string;
    url: string;
}

export type EmbedPart = TextFragment | EmbedFragment;

// Regular expression to match URLs
const URL_REGEX = /https?:\/\/[^\s<>]+/g;

export function parseEmbed(content: string): EmbedPart[] {
    if (!content) {
        return [{ type: 'text', content: '' }];
    }

    const fragments: EmbedPart[] = [];
    let lastIndex = 0;
    let match;

    // Find all URLs in the content
    while ((match = URL_REGEX.exec(content)) !== null) {
        // Add text before the URL
        if (match.index > lastIndex) {
            fragments.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        try {
            const url = match[0];
            const urlObj = new URL(url);

            // YouTube
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                const videoId = urlObj.hostname.includes('youtu.be')
                    ? urlObj.pathname.slice(1)
                    : urlObj.searchParams.get('v');
                if (videoId) {
                    fragments.push({
                        type: 'embed',
                        embedType: 'youtube',
                        id: videoId,
                        url: `https://www.youtube.com/embed/${videoId}`
                    });
                } else {
                    fragments.push({ type: 'text', content: url });
                }
            }
            // Twitter
            else if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
                const tweetPath = urlObj.pathname.split('/status/')[1];
                if (tweetPath) {
                    fragments.push({
                        type: 'embed',
                        embedType: 'twitter',
                        id: tweetPath.split('?')[0],
                        url: url
                    });
                } else {
                    fragments.push({ type: 'text', content: url });
                }
            }
            // Instagram
            else if (urlObj.hostname.includes('instagram.com')) {
                const postId = urlObj.pathname.split('/p/')[1]?.split('/')[0];
                if (postId) {
                    fragments.push({
                        type: 'embed',
                        embedType: 'instagram',
                        id: postId,
                        url: `https://www.instagram.com/p/${postId}/embed`
                    });
                } else {
                    fragments.push({ type: 'text', content: url });
                }
            }
            // Other URLs
            else {
                fragments.push({ type: 'text', content: url });
            }
        } catch (error) {
            // If URL parsing fails, treat it as regular text
            fragments.push({
                type: 'text',
                content: match[0]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last URL
    if (lastIndex < content.length) {
        fragments.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return fragments;
}

export function isEmbeddable(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (
            urlObj.hostname.includes('youtube.com') ||
            urlObj.hostname.includes('youtu.be') ||
            urlObj.hostname.includes('twitter.com') ||
            urlObj.hostname.includes('x.com') ||
            urlObj.hostname.includes('instagram.com')
        );
    } catch {
        return false;
    }
}
