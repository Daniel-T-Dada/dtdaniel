'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import { toast } from 'react-hot-toast';

// Import TinyMCE with dynamic import to avoid SSR issues
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
    ssr: false,
    loading: () => <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
});

export default function BlogPostForm({ post = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: post?.title || '',
        content: post?.content || '',
        excerpt: post?.excerpt || '',
        category: post?.category || '',
        tags: post?.tags?.join(', ') || '',
        coverImage: post?.coverImage || '',
        published: post?.published || false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = post?.slug || slugify(formData.title, { lower: true, strict: true });
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);

            const postData = {
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt,
                category: formData.category,
                tags,
                coverImage: formData.coverImage,
                published: formData.published,
                slug,
                updatedAt: serverTimestamp(),
                ...(post ? {} : { createdAt: serverTimestamp() })
            };

            const docRef = doc(db, 'blog-posts', post?.id || crypto.randomUUID());
            await setDoc(docRef, postData, { merge: true });

            toast.success(post ? 'Post updated successfully!' : 'Post created successfully!');
            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Error saving post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[95vw] lg:max-w-none mx-auto">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title"
                />
            </div>

            {/* Cover Image & Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Cover Image URL
                    </label>
                    <input
                        type="url"
                        className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.coverImage && (
                        <div className="mt-4">
                            <img
                                src={formData.coverImage}
                                alt="Cover preview"
                                className="w-full h-32 lg:h-48 object-cover rounded-md"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Category
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Technology, Life, Travel"
                    />
                </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Excerpt
                </label>
                <textarea
                    className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary of your post (appears in blog list)"
                />
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Content *
                </label>
                <div className="prose max-w-none">
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        value={formData.content}
                        onEditorChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        init={{
                            height: 400,
                            menubar: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'styles | bold italic | ' +
                                'bullist numlist | link image | ' +
                                'alignleft aligncenter alignright',
                            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; }',
                            skin: formData.darkMode ? 'oxide-dark' : 'oxide',
                            content_css: formData.darkMode ? 'dark' : 'default',
                            mobile: {
                                menubar: false,
                                toolbar: 'undo redo bold italic | link image | bullist numlist',
                                height: 300
                            }
                        }}
                    />
                </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Tags
                </label>
                <input
                    type="text"
                    className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                />
            </div>

            {/* Publishing Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="published"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        checked={formData.published}
                        onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                        Publish post
                    </label>
                </div>
                <p className="mt-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {formData.published ? 'This post will be visible to the public' : 'This post will be saved as a draft'}
                </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                    type="button"
                    onClick={() => router.push('/admin/blog')}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
                </button>
            </div>
        </form>
    );
}