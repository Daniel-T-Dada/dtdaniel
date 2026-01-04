"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { notify } from '@/utils/toast';
// @ts-ignore
import { schedulePost, updateScheduledPost } from '@/utils/scheduleManager';
import SEOFields from './blog/SEOFields';
import PublishingOptions from './blog/PublishingOptions';
import BlogEditor from './blog/Editor';

interface BlogPostFormProps {
    post?: any; // Define a proper interface for Post later or import it
}

export default function BlogPostForm({ post = null }: BlogPostFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State management
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [category, setCategory] = useState(post?.category || '');
    const [tags, setTags] = useState(post?.tags?.join(', ') || '');
    const [coverImage, setCoverImage] = useState(post?.coverImage || '');
    const [published, setPublished] = useState(post?.published || false);
    const [scheduledFor, setScheduledFor] = useState(post?.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '');
    const [selectedMedia, setSelectedMedia] = useState(post?.media || []);

    const handleMediaSelect = (media: any) => {
        setSelectedMedia(Array.isArray(media) ? media : [media]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = post?.slug || slugify(title, { lower: true, strict: true });
            const tagList = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);

            const postData: any = {
                title,
                content,
                excerpt,
                category,
                tags: tagList,
                coverImage,
                published,
                slug,
                updatedAt: serverTimestamp(),
                media: selectedMedia,
                ...(post ? {} : { createdAt: serverTimestamp() })
            };

            // Update status based on published/scheduled state
            if (scheduledFor) {
                // If the user sets a schedule, we override the publish status and set scheduledFor
                if (published) {
                    // If user checked publish AND schedule, schedule usually takes precedence or implies auto-publish
                    postData.published = false;
                }
            } else {
                if (published) {
                    postData.published = true;
                    postData.status = 'published';
                } else {
                    postData.published = false;
                    postData.status = 'draft';
                }
            }

            if (scheduledFor) {
                // Handle scheduled post
                if (post?.id) {
                    await updateScheduledPost(post.id, postData, new Date(scheduledFor));
                } else {
                    await schedulePost(postData, new Date(scheduledFor));
                }
                notify.success(post ? 'Post schedule updated!' : 'Post scheduled successfully!');
            } else {
                // Handle regular post
                const docRef = doc(db, 'blog-posts', post?.id || crypto.randomUUID());
                await setDoc(docRef, postData, { merge: true });
                notify.success(post ? 'Post updated successfully!' : 'Post created successfully!');
            }

            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            console.error('Error saving post:', error);
            notify.error('Error saving post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[95vw] lg:max-w-none mx-auto">
            <SEOFields
                title={title} setTitle={setTitle}
                coverImage={coverImage} setCoverImage={setCoverImage}
                category={category} setCategory={setCategory}
                excerpt={excerpt} setExcerpt={setExcerpt}
                tags={tags} setTags={setTags}
            />

            <BlogEditor
                content={content}
                setContent={setContent}
                onMediaSelect={handleMediaSelect}
                selectedMedia={selectedMedia}
            />

            <PublishingOptions
                scheduledFor={scheduledFor} setScheduledFor={(val) => {
                    setScheduledFor(val);
                    if (val) {
                        setPublished(false);
                    }
                }}
                published={published} setPublished={(val) => {
                    setPublished(val);
                    if (val) {
                        setScheduledFor('');
                    }
                }}
            />

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
