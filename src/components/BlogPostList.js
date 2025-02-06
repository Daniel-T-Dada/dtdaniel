'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function BlogPostList({ initialPosts }) {
    const [posts, setPosts] = useState(initialPosts);
    const router = useRouter();

    const handleDelete = async (postId) => {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'blog-posts', postId));
                setPosts(posts.filter(post => post.id !== postId));
                router.refresh();
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Error deleting post. Please try again.');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Desktop view - Table */}
            <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {post.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        {post.category || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                                        }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/blog/${post.id}`}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 mr-4"
                                        target="_blank"
                                    >
                                        View
                                    </Link>
                                    <button
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                                        onClick={() => handleDelete(post.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                    <div key={post.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 min-w-0 pr-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {post.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 items-center text-xs">
                                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        {post.category || 'Uncategorized'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${post.published
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                                        }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 border-t dark:border-gray-700 pt-3">
                            <Link
                                href={`/admin/blog/${post.id}`}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200"
                            >
                                Edit
                            </Link>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200"
                                target="_blank"
                            >
                                View
                            </Link>
                            <button
                                onClick={() => handleDelete(post.id)}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No blog posts yet</p>
                </div>
            )}
        </div>
    );
} 