import { Feed } from 'feed';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dtdaniel.site';

export async function generateSitemapXml(): Promise<string> {
    const now = new Date().toISOString();

    // Start with static routes
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/projects</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    try {
        // Add blog posts - Using a simpler query first
        const blogRef = collection(db, 'blog-posts');
        const q = query(blogRef, where('published', '==', true));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const post = doc.data();
            const lastMod = post.updatedAt?.toDate?.()?.toISOString() || now;
            sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        sitemap += '\n</urlset>';
        return sitemap;
    } catch (error) {
        console.error('Error in generateSitemapXml:', error);
        throw error;
    }
}

export async function generateBlogSitemapXml(): Promise<string> {
    const now = new Date().toISOString();
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    try {
        // Using simpler query here as well
        const blogRef = collection(db, 'blog-posts');
        const q = query(blogRef, where('published', '==', true));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const post = doc.data();
            const lastMod = post.updatedAt?.toDate?.()?.toISOString() || now;
            sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        sitemap += '\n</urlset>';
        return sitemap;
    } catch (error) {
        console.error('Error in generateBlogSitemapXml:', error);
        throw error;
    }
}

export async function generateRssFeed(): Promise<string> {
    const feed = new Feed({
        title: 'Daniel Dada Blog',
        description: 'Thoughts, stories and ideas about tech, life, and everything in between',
        id: BASE_URL,
        link: BASE_URL,
        language: 'en',
        image: `${BASE_URL}/images/og-blog.png`,
        favicon: `${BASE_URL}/favicon.ico`,
        copyright: `All rights reserved ${new Date().getFullYear()}, Daniel Dada`,
        author: {
            name: 'Daniel Dada',
            email: 'simplytobs@gmail.com',
            link: BASE_URL
        }
    });

    // Add blog posts
    const blogRef = collection(db, 'blog-posts');
    const q = query(
        blogRef,
        where('published', '==', true),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
        const post = doc.data();
        feed.addItem({
            title: post.title,
            id: `${BASE_URL}/blog/${post.slug}`,
            link: `${BASE_URL}/blog/${post.slug}`,
            description: post.excerpt || post.content.substring(0, 200) + '...',
            content: post.content,
            author: [{
                name: 'Daniel Dada',
                email: 'simplytobs@gmail.com',
                link: BASE_URL
            }],
            date: post.createdAt.toDate(),
            image: post.coverImage || `${BASE_URL}/images/og-blog.png`,
        });
    });

    return feed.rss2();
}

export interface PingResult {
    engine: string;
    status: number;
}

// Function to ping search engines about sitemap updates
export async function pingSearchEngines(): Promise<PingResult[]> {
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const searchEngines = [
        `http://www.google.com/webmasters/sitemaps/ping?sitemap=${sitemapUrl}`,
        `http://www.bing.com/ping?sitemap=${sitemapUrl}`
    ];

    try {
        const results = await Promise.all(
            searchEngines.map(url =>
                fetch(url).then(res => ({
                    engine: url.includes('google') ? 'Google' : 'Bing',
                    status: res.status
                }))
            )
        );

        return results;
    } catch (error) {
        console.error('Error pinging search engines:', error);
        return [];
    }
}
