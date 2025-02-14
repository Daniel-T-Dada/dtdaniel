'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import { toast } from 'react-hot-toast';
import { schedulePost, updateScheduledPost } from '@/utils/scheduleManager';
import MediaSelector from './MediaSelector';
import OptimizedImage from './common/OptimizedImage';
import { BlogFormSkeleton } from './common/FormSkeleton';
import { embedPlugin } from '@/utils/tinyMceEmbedPlugin';
import { playgroundPlugin } from '@/utils/tinyMcePlaygroundPlugin';
import { galleryPlugin } from '@/utils/tinyMceGalleryPlugin';
import { chartPlugin } from '@/utils/tinyMceChartPlugin';
import { mermaidPlugin } from '@/utils/tinyMceMermaidPlugin';
import ReactDOM from 'react-dom/client';

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
        scheduledFor: post?.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '',
        status: post?.status || 'draft'
    });
    const [selectedMedia, setSelectedMedia] = useState(post?.media || []);

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
                media: selectedMedia,
                ...(post ? {} : { createdAt: serverTimestamp() })
            };

            if (formData.scheduledFor) {
                if (post?.id) {
                    await updateScheduledPost(post.id, postData, formData.scheduledFor);
                } else {
                    await schedulePost(postData, formData.scheduledFor);
                }
                toast.success(post ? 'Post schedule updated!' : 'Post scheduled successfully!');
            } else {
                const docRef = doc(db, 'blog-posts', post?.id || crypto.randomUUID());
                await setDoc(docRef, postData, { merge: true });
                toast.success(post ? 'Post updated successfully!' : 'Post created successfully!');
            }

            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Error saving post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMediaSelect = (media) => {
        setSelectedMedia(Array.isArray(media) ? media : [media]);
    };

    const editorConfig = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link embed playground gallery chart mermaid | help',
        content_style: `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333;
            }
            pre {
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 4px;
                overflow-x: auto;
            }
            .embed-container {
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                max-width: 100%;
            }
            .gallery-container {
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 4px;
                margin: 1em 0;
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
            }
        `,
        setup: (editor) => {
            playgroundPlugin(editor);
            galleryPlugin(editor);
            embedPlugin(editor);
            chartPlugin(editor);
            mermaidPlugin(editor);
        },
        mediaSelector: {
            render: (container, options) => {
                const root = ReactDOM.createRoot(container);
                root.render(
                    <MediaSelector
                        onSelect={options.onSelect}
                        multiple={options.multiple}
                    />
                );
                return {
                    destroy: () => {
                        root.unmount();
                    }
                };
            }
        }
    };

    if (loading) {
        return <BlogFormSkeleton />;
    }

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
                            <OptimizedImage
                                src={formData.coverImage}
                                alt="Cover preview"
                                width={1200}
                                height={630}
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
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Content *
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            const testContent = `
<h2>Introduction</h2>
<p>This is a test post to demonstrate the enhanced code block features. We'll look at different programming languages and formatting options.</p>

<h2>JavaScript Example</h2>
<p>Here's a simple JavaScript function with some comments:</p>

<pre class="language-javascript filename="example.js"">
// A simple function to calculate factorial
function factorial(n) {
    // Base case
    if (n <= 1) return 1;
    
    // Recursive case
    return n * factorial(n - 1);
}

// Test the function
console.log(factorial(5)); // Output: 120
</pre>

<h2>Python Example</h2>
<p>Let's look at a Python class definition:</p>

<pre class="language-python filename="person.py"">
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, my name is {self.name} and I'm {self.age} years old!"

# Create a new person
person = Person("Alice", 30)
print(person.greet())
</pre>

<h3>Testing Features</h3>
<p>This post demonstrates:</p>
<ul>
    <li>Syntax highlighting for multiple languages</li>
    <li>Copy button functionality</li>
    <li>Language indicators</li>
    <li>Filename display</li>
    <li>Line numbers</li>
</ul>`;
                            setFormData(prev => ({
                                ...prev,
                                title: "Testing Code Block Features",
                                category: "Development",
                                tags: "code, testing, development",
                                content: testContent
                            }));
                        }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                    >
                        Load Test Template
                    </button>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Media Gallery
                    </label>
                    <MediaSelector
                        onSelect={handleMediaSelect}
                        multiple={true}
                        selectedMedia={selectedMedia}
                    />
                </div>
                <div className="prose max-w-none">
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        value={formData.content}
                        onEditorChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        init={editorConfig}
                    />
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>To add code blocks:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                        <li>Click the {'<>'} (Code Sample) button in the toolbar</li>
                        <li>Select a language from the dropdown</li>
                        <li>Paste or type your code</li>
                        <li>Click OK to insert the code block</li>
                    </ol>
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

            {/* Scheduling Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Schedule Publication
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                        value={formData.scheduledFor}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                scheduledFor: e.target.value,
                                published: false,
                                status: e.target.value ? 'scheduled' : 'draft'
                            }));
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.scheduledFor
                            ? `This post will be published on ${new Date(formData.scheduledFor).toLocaleString()}`
                            : 'Leave empty to publish immediately or save as draft'
                        }
                    </p>
                </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="published"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        checked={formData.published}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                published: e.target.checked,
                                scheduledFor: e.target.checked ? '' : prev.scheduledFor,
                                status: e.target.checked ? 'published' : 'draft'
                            }));
                        }}
                        disabled={!!formData.scheduledFor}
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                        Publish now
                    </label>
                </div>
                <p className="mt-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {formData.scheduledFor
                        ? 'Scheduled posts cannot be published immediately'
                        : formData.published
                            ? 'This post will be visible to the public'
                            : 'This post will be saved as a draft'
                    }
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