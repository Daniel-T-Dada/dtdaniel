/**
 * Parses a URL and returns information about the embed type and ID
 * @param {string} url - The URL to parse
 * @returns {{ type: 'youtube'|'twitter'|'instagram'|'unknown', id: string|null, error: string|null }}
 */
export function parseEmbed(url) {
    try {
        const urlObj = new URL(url);

        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId = null;

            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.searchParams.has('v')) {
                videoId = urlObj.searchParams.get('v');
            }

            if (!videoId) {
                return { type: 'unknown', id: null, error: 'Invalid YouTube URL format' };
            }

            return { type: 'youtube', id: videoId, error: null };
        }

        // Twitter
        if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
            const matches = urlObj.pathname.match(/\/status\/(\d+)/);
            if (!matches) {
                return { type: 'unknown', id: null, error: 'Invalid Twitter URL format' };
            }
            return { type: 'twitter', id: matches[1], error: null };
        }

        // Instagram
        if (urlObj.hostname.includes('instagram.com')) {
            const matches = urlObj.pathname.match(/\/p\/([^/]+)/);
            if (!matches) {
                return { type: 'unknown', id: null, error: 'Invalid Instagram URL format' };
            }
            return { type: 'instagram', id: matches[1], error: null };
        }

        return { type: 'unknown', id: null, error: 'Unsupported URL type' };
    } catch (error) {
        return { type: 'unknown', id: null, error: 'Invalid URL format' };
    }
}

/**
 * Checks if a URL is from a supported embed platform
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isEmbeddable(url) {
    try {
        const urlObj = new URL(url);
        const supportedHosts = [
            'youtube.com',
            'youtu.be',
            'twitter.com',
            'x.com',
            'instagram.com'
        ];

        return supportedHosts.some(host => urlObj.hostname.includes(host));
    } catch {
        return false;
    }
}

/**
 * Returns the appropriate component type for an embed URL
 * @param {string} url - The URL to get the component type for
 * @returns {'YouTubeEmbed'|'TwitterEmbed'|'InstagramEmbed'|null}
 */
export function getEmbedComponent(url) {
    const { type } = parseEmbed(url);

    const componentMap = {
        youtube: 'YouTubeEmbed',
        twitter: 'TwitterEmbed',
        instagram: 'InstagramEmbed'
    };

    return componentMap[type] || null;
} 