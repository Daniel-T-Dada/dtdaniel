import BlogPostForm from '@/components/BlogPostForm';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function NewBlogPost() {
    return (
        <div className="space-y-6">
            {/* Navigation */}
            <nav className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Dashboard
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-2" />
                <Link href="/admin/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Blog Posts
                </Link>
                <ChevronRightIcon className="h-4 w-4 mx-2" />
                <span className="text-gray-900 dark:text-gray-200">New Post</span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Blog Post</h1>
            <BlogPostForm />
        </div>
    );
}