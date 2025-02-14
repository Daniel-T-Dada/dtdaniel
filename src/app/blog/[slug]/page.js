import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from '@heroicons/react/24/outline';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import CodeBlock from '@/components/CodeBlock';
import { processCodeBlocks } from '@/utils/processCodeBlocks';
import { generateBlogPostSchema, generateBreadcrumbSchema, generatePersonSchema } from '@/utils/schemaGenerators';
import EmbedRenderer from '@/components/embeds/EmbedRenderer';
import BlogContent from '@/components/BlogContent';

export const revalidate = 3600; // Revalidate every hour

// Generate metadata for the page
export async function generateMetadata({ params }) {
    // Await params before destructuring
    const { slug } = await Promise.resolve(params);
    const post = await getBlogPost(slug);
    if (!post) return null;

    const jsonLd = {
        article: generateBlogPostSchema(post),
        breadcrumb: generateBreadcrumbSchema([
            { name: 'Home', url: process.env.NEXT_PUBLIC_BASE_URL },
            { name: 'Blog', url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog` },
            { name: post.title, url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}` }
        ]),
        author: generatePersonSchema(),
        webpage: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: post.title,
            description: post.excerpt || post.content.substring(0, 200),
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`,
            author: generatePersonSchema(),
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            image: post.coverImage || `${process.env.NEXT_PUBLIC_BASE_URL}/images/og-blog.png`,
            isPartOf: {
                '@type': 'Blog',
                name: 'Daniel Dada Blog',
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`
            }
        }
    };

    return {
        title: `${post.title} | Daniel Dada Blog`,
        description: post.excerpt || post.content.substring(0, 200),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 200),
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`,
            siteName: 'Daniel Dada Blog',
            images: [
                {
                    url: post.coverImage || `${process.env.NEXT_PUBLIC_BASE_URL}/images/og-blog.png`,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            authors: ['Daniel Dada'],
            tags: post.tags || [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.content.substring(0, 200),
            creator: '@simplytobs',
            images: [post.coverImage || `${process.env.NEXT_PUBLIC_BASE_URL}/images/og-blog.png`],
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`,
        },
        other: {
            'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
        jsonLd,
    };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    try {
        const blogRef = collection(db, 'blog-posts');
        const q = query(blogRef, where('published', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            slug: doc.data().slug
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

async function getAdjacentPosts(currentSlug, createdAt) {
    try {
        const blogRef = collection(db, 'blog-posts');

        // Get previous post (only published posts)
        const prevQuery = query(
            blogRef,
            where('published', '==', true),
            where('createdAt', '>', createdAt),
            orderBy('createdAt'),
            limit(1)
        );

        // Get next post (only published posts)
        const nextQuery = query(
            blogRef,
            where('published', '==', true),
            where('createdAt', '<', createdAt),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        try {
            const [prevSnapshot, nextSnapshot] = await Promise.all([
                getDocs(prevQuery),
                getDocs(nextQuery)
            ]);

            return {
                previousPost: prevSnapshot.empty ? null : {
                    slug: prevSnapshot.docs[0].data().slug,
                    title: prevSnapshot.docs[0].data().title
                },
                nextPost: nextSnapshot.empty ? null : {
                    slug: nextSnapshot.docs[0].data().slug,
                    title: nextSnapshot.docs[0].data().title
                }
            };
        } catch (queryError) {
            // If it's an indexing error, return null for both
            if (queryError.code === 'failed-precondition') {
                console.log('Adjacent posts indexes are still building. Navigation will be available once indexes are ready.');
                return { previousPost: null, nextPost: null };
            }
            throw queryError;
        }
    } catch (error) {
        console.error('Error fetching adjacent posts:', error);
        return { previousPost: null, nextPost: null };
    }
}

async function getBlogPost(slug) {
    try {
        const blogRef = collection(db, 'blog-posts');
        // First try to get the post without the published filter
        const allPostsQuery = query(blogRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(allPostsQuery);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Convert media timestamps if media exists
        const media = data.media?.map(item => ({
            ...item,
            uploadedAt: item.uploadedAt?.toDate?.()?.toISOString() || null,
            updatedAt: item.updatedAt?.toDate?.()?.toISOString() || null
        })) || [];

        return {
            id: doc.id,
            ...data,
            media,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

async function BlogPostContent({ slug }) {
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const { previousPost, nextPost } = post.published ? await getAdjacentPosts(slug, post.createdAt) : { previousPost: null, nextPost: null };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const postUrl = `${baseUrl}/blog/${post.slug}`;

    // Strip HTML tags and get plain text for description
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

    // Prepare share URLs with proper encoding and metadata
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.title} by @simplytobs`)}&url=${encodeURIComponent(postUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt || stripHtml(post.content).substring(0, 160))}&source=${encodeURIComponent('Daniel Dada Portfolio')}`,
    };

    return (
        <article className="min-h-screen bg-white dark:bg-gray-900 py-12">
            <ReadingProgress content={post.content} />
            <TableOfContents content={post.content} />

            {/* Draft Preview Banner */}
            {!post.published && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-100 dark:border-yellow-900 sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
                        <div className="flex items-center justify-center">
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-yellow-400 dark:bg-yellow-500 mr-2"></span>
                            <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Preview Mode - This is an unpublished draft
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Link */}
            <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 mb-6 sm:mb-8">
                <Link
                    href={post.published ? "/blog" : "/admin/blog"}
                    className="inline-flex items-center text-sm sm:text-base text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                    <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                    {post.published ? "Back to Blog" : "Back to Admin"}
                </Link>
            </div>

            <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
                {post.coverImage && (
                    <div className="relative w-full aspect-[16/9] mb-6 sm:mb-8">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover rounded-lg"
                            priority
                        />
                    </div>
                )}

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {post.title}
                </h1>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                    <time dateTime={post.createdAt}>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                    {post.tags && post.tags.length > 0 && (
                        <>
                            <span className="mx-2">•</span>
                            <div className="flex items-center gap-2">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <BlogContent content={post.content} />

                {/* Share buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Share this post
                    </h2>
                    <div className="flex gap-4">
                        {Object.entries(shareUrls).map(([platform, url]) => (
                            <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigation between posts */}
                {post.published && (
                    <nav className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            {previousPost && (
                                <Link
                                    href={`/blog/${previousPost.slug}`}
                                    className="group"
                                >
                                    <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Previous Post
                                    </span>
                                    <span className="block text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {previousPost.title}
                                    </span>
                                </Link>
                            )}
                            {nextPost && (
                                <Link
                                    href={`/blog/${nextPost.slug}`}
                                    className="group text-right"
                                >
                                    <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Next Post
                                    </span>
                                    <span className="block text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {nextPost.title}
                                    </span>
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </article>
    );
}

export default async function BlogPost({ params }) {
    // Ensure params is awaited
    const { slug } = await Promise.resolve(params);
    const post = await getBlogPost(slug);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
                </div>
            }
        >
            <BlogPostContent slug={post?.slug} />
        </Suspense>
    );
}