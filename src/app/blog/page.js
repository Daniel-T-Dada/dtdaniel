import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export const revalidate = 3600; // Revalidate every hour

export const metadata = {
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
    },
};

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
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Thoughts, stories and ideas about tech, life, and everything in between
                    </p>
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