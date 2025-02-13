import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import BlogPostForm from '@/components/BlogPostForm';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

export const revalidate = 0; // Don't cache admin pages

async function getBlogPost(id) {
    try {
        const docRef = doc(db, 'blog-posts', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

function EditPageContent({ post }) {
    if (!post) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <nav className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm overflow-x-auto pb-2 sm:pb-0">
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">
                    Dashboard
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-1 sm:mx-2 flex-shrink-0" />
                <Link href="/admin/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">
                    Blog Posts
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-1 sm:mx-2 flex-shrink-0" />
                <span className="text-gray-900 dark:text-gray-200 whitespace-nowrap">Edit Post</span>
            </nav>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Blog Post</h1>
            <BlogPostForm post={post} />
        </div>
    );
}

export default async function EditBlogPost({ params }) {
    // Ensure params is awaited
    const { id } = await Promise.resolve(params);
    const post = await getBlogPost(id);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
                </div>
            }
        >
            <EditPageContent post={post} />
        </Suspense>
    );
} 