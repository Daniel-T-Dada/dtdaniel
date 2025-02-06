import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ShareIcon } from '@heroicons/react/24/outline';
import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

// Generate metadata for the page
export async function generateMetadata({ params }) {
    const post = await getBlogPost(params.slug);
    if (!post) return {};

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/blog/${post.slug}`;

    // Strip HTML tags and get plain text for description
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '');
    const description = post.excerpt || stripHtml(post.content).substring(0, 160).trim() + '...';

    // Use post cover image or default to site OG image
    const imageUrl = post.coverImage || `${baseUrl}/images/og-default.png`;

    return {
        title: `${post.title} | Daniel Dada`,
        description,
        openGraph: {
            title: post.title,
            description,
            url,
            siteName: 'Daniel Dada Portfolio',
            images: [
                {
                    url: imageUrl,
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
            description,
            images: [imageUrl],
            creator: '@simplytobs',
            site: '@simplytobs',
        },
        alternates: {
            canonical: url,
        },
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
        return {
            id: doc.id,
            ...data,
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
                            className="rounded-lg shadow-lg object-cover"
                            priority
                        />
                    </div>
                )}

                <header className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                        <time dateTime={post.createdAt} className="text-sm">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                        {post.category && (
                            <>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-1 rounded-full text-sm">
                                    {post.category}
                                </span>
                            </>
                        )}
                        {!post.published && (
                            <>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 sm:px-3 py-1 rounded-full text-sm">
                                    Draft
                                </span>
                            </>
                        )}
                    </div>

                    {/* Share buttons */}
                    {post.published && (
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <a
                                href={shareUrls.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="Share on Twitter"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a
                                href={shareUrls.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                                title="Share on Facebook"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                            </a>
                            <a
                                href={shareUrls.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-600 transition-colors"
                                title="Share on LinkedIn"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    )}
                </header>

                <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none px-1 sm:px-0">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 sm:mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show navigation only for published posts - Mobile Optimized */}
                {post.published && (
                    <nav className="mt-8 sm:mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            {previousPost ? (
                                <Link
                                    href={`/blog/${previousPost.slug}`}
                                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                    <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    <div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Previous</div>
                                        <div className="text-xs sm:text-sm font-medium line-clamp-1">{previousPost.title}</div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="w-16"></div>
                            )}

                            {nextPost ? (
                                <Link
                                    href={`/blog/${nextPost.slug}`}
                                    className="flex items-center text-right text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                    <div>
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Next</div>
                                        <div className="text-xs sm:text-sm font-medium line-clamp-1">{nextPost.title}</div>
                                    </div>
                                    <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                                </Link>
                            ) : (
                                <div className="w-16"></div>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </article>
    );
}

export default async function BlogPost({ params }) {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
                </div>
            }
        >
            <BlogPostContent slug={params.slug} />
        </Suspense>
    );
}