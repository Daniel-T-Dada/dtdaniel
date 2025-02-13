import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { generateBlogListSchema, generateBreadcrumbSchema } from '@/utils/schemaGenerators';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
    const posts = await getBlogPosts();

    const jsonLd = {
        blogList: generateBlogListSchema(posts),
        breadcrumb: generateBreadcrumbSchema([
            { name: 'Home', url: process.env.NEXT_PUBLIC_BASE_URL },
            { name: 'Blog', url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog` }
        ])
    };

    return {
        title: 'Blog | Daniel Dada',
        description: 'Thoughts, stories and ideas about tech, life, and everything in between',
        openGraph: {
            title: 'Blog | Daniel Dada',
            description: 'Thoughts, stories and ideas about tech, life, and everything in between',
            url: 'https://dtdaniel.site/blog',
            siteName: 'Daniel Dada Portfolio',
            images: [
                {
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/og-blog.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Daniel Dada Blog',
                }
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Blog | Daniel Dada',
            description: 'Thoughts, stories and ideas about tech, life, and everything in between',
            creator: '@simplytobs',
            images: [`${process.env.NEXT_PUBLIC_BASE_URL}/images/og-blog.png`],
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
            types: {
                'application/rss+xml': [
                    {
                        url: '/feed.xml',
                        title: 'Daniel Dada Blog RSS Feed'
                    }
                ]
            }
        },
        other: {
            'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
        jsonLd,
    };
}

async function getBlogPosts() {
    try {
        const blogRef = collection(db, 'blog-posts');
        const q = query(
            blogRef,
            where('published', '==', true),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        // If it's an indexing error, return empty array but log the error
        if (error.code === 'failed-precondition') {
            console.log('Please create the required index using the link in the error message above');
            return [];
        }
        throw error;
    }
}

export default async function BlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back to Home
                    </Link>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">My Blog</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                        Thoughts, stories and ideas about tech, life, and everything in between
                    </p>
                    <a
                        href="/feed.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Subscribe to RSS feed"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                            <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
                            <path d="M3 15a2 2 0 114 0 2 2 0 01-4 0z" />
                        </svg>
                        Subscribe via RSS
                    </a>
                </div>

                {posts.length > 0 ? (
                    <div className="mt-12 space-y-8">
                        {posts.map((post, index) => (
                            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="p-6">
                                        {post.coverImage && (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={800}
                                                height={400}
                                                className="w-full h-48 object-cover rounded-md mb-4"
                                                priority={index === 0}
                                            />
                                        )}
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {post.title}
                                        </h2>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            <time dateTime={post.createdAt}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </time>
                                            {post.category && (
                                                <>
                                                    <span className="mx-2">•</span>
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                        {post.category}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                        </p>
                                        <div className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                                            Read more →
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No Posts Yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Check back soon for new content!
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                            >
                                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                                Return Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}