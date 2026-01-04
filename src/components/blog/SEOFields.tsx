"use client";

import React from 'react';

interface SEOFieldsProps {
    title: string;
    setTitle: (value: string) => void;
    coverImage: string;
    setCoverImage: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    excerpt: string;
    setExcerpt: (value: string) => void;
    tags: string;
    setTags: (value: string) => void;
}

export default function SEOFields({
    title,
    setTitle,
    coverImage,
    setCoverImage,
    category,
    setCategory,
    excerpt,
    setExcerpt,
    tags,
    setTags
}: SEOFieldsProps) {
    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    {coverImage && (
                        <div className="mt-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={coverImage}
                                alt="Cover preview"
                                className="w-full h-32 lg:h-48 object-cover rounded-md"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
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
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of your post (appears in blog list)"
                />
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Tags
                </label>
                <input
                    type="text"
                    className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm lg:text-base"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas"
                />
            </div>
        </div>
    );
}
