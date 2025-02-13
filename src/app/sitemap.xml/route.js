import { generateSitemapXml } from '@/utils/sitemapGenerator';

export async function GET() {
    try {
        const sitemap = await generateSitemapXml();
        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
} 