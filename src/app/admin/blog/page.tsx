import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
// @ts-ignore
import BlogPostList from '@/components/BlogPostList';
import type { BlogPost } from '../../../types/blog';

export const revalidate = 0; // Don't cache admin pages

async function getBlogPosts(): Promise<BlogPost[]> {
    const blogRef = collection(db, 'blog-posts');
    const q = query(blogRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings and ensure full type compatibility
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            scheduledFor: data.scheduledFor?.toDate?.()?.toISOString() || data.scheduledFor
        } as unknown as BlogPost;
    });
}

export default async function AdminBlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Navigation - Mobile Optimized */}
            <nav className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm overflow-x-auto pb-2 sm:pb-0">
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">
                    Dashboard
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-1 sm:mx-2 flex-shrink-0" />
                <span className="text-gray-900 dark:text-gray-200 whitespace-nowrap">Blog Posts</span>
            </nav>

            {/* Header Section - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Manage Blog Posts
                </h1>
                <Link
                    href="/admin/blog/new"
                    className="inline-flex justify-center items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                    Create New Post
                </Link>
            </div>

            {/* Blog Post List */}
            <div className="mt-4 sm:mt-6">
                <BlogPostList initialPosts={posts} />
            </div>
        </div>
    );
}
