const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Daniel Dada Portfolio',
        url: BASE_URL,
        description: 'Personal portfolio and blog of Daniel Dada, a Full Stack Developer',
        author: generatePersonSchema(),
        sameAs: [
            'https://github.com/yourusername',
            'https://linkedin.com/in/yourusername',
            'https://twitter.com/simplytobs'
        ]
    };
}

export function generatePersonSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Daniel Dada',
        url: BASE_URL,
        image: `${BASE_URL}/images/profile.jpg`,
        jobTitle: 'Full Stack Developer',
        email: 'simplytobs@gmail.com',
        description: 'Full Stack Developer passionate about building web applications',
        sameAs: [
            'https://github.com/yourusername',
            'https://linkedin.com/in/yourusername',
            'https://twitter.com/simplytobs'
        ]
    };
}

export function generateBlogPostSchema(post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || post.content.substring(0, 200),
        image: post.coverImage || `${BASE_URL}/images/og-blog.png`,
        url: `${BASE_URL}/blog/${post.slug}`,
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        author: generatePersonSchema(),
        publisher: {
            '@type': 'Person',
            name: 'Daniel Dada',
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/images/profile.jpg`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/blog/${post.slug}`
        },
        keywords: post.tags?.join(', ') || '',
        articleBody: post.content.replace(/<[^>]*>/g, '')
    };
}

export function generateBreadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
}

export function generateBlogListSchema(posts) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Daniel Dada Blog',
        url: `${BASE_URL}/blog`,
        description: 'Thoughts, stories and ideas about tech, life, and everything in between',
        author: generatePersonSchema(),
        blogPost: posts.map(post => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: `${BASE_URL}/blog/${post.slug}`,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: generatePersonSchema(),
            description: post.excerpt || post.content.substring(0, 200),
            image: post.coverImage || `${BASE_URL}/images/og-blog.png`
        }))
    };
} 