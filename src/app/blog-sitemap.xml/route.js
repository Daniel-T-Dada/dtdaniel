import { generateBlogSitemapXml } from '@/utils/sitemapGenerator';

export async function GET() {
    try {
        const sitemap = await generateBlogSitemapXml();
        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating blog sitemap:', error);
        return new Response('Error generating blog sitemap', { status: 500 });
    }
} 