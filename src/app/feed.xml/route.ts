import { generateRssFeed } from '@/utils/sitemapGenerator';

export async function GET() {
    try {
        const feed = await generateRssFeed();
        return new Response(feed, {
            headers: {
                'Content-Type': 'application/rss+xml',
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        return new Response('Error generating RSS feed', { status: 500 });
    }
}
