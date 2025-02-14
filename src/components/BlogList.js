'use client';

import { BlogGridSkeleton, BlogListSkeleton, BlogHeaderSkeleton } from './common/BlogSkeleton';

export default function BlogList({ view = 'grid', isLoading = false }) {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <BlogHeaderSkeleton />
                {view === 'grid' ? (
                    <BlogGridSkeleton items={6} />
                ) : (
                    <BlogListSkeleton items={5} />
                )}
            </div>
        );
    }

    return null; // Replace with your actual blog list content
} 