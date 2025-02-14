'use client';

import { Skeleton, CardSkeleton } from './Skeleton';

export function BlogCardSkeleton({ isCompact = false }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${isCompact ? 'h-48' : ''}`}>
            {/* Image */}
            <div className={`relative ${isCompact ? 'w-1/3 float-left h-full' : 'w-full aspect-video'}`}>
                <Skeleton className="w-full h-full" />
            </div>

            {/* Content */}
            <div className={`p-4 ${isCompact ? 'w-2/3 float-left h-full' : ''}`}>
                <div className="space-y-3">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>

                    {/* Title */}
                    <Skeleton className="h-6 w-3/4" />

                    {/* Excerpt */}
                    {!isCompact && (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center space-x-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-16 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BlogGridSkeleton({ items = 6, isCompact = false }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: items }).map((_, i) => (
                <BlogCardSkeleton key={i} isCompact={isCompact} />
            ))}
        </div>
    );
}

export function BlogListSkeleton({ items = 5 }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: items }).map((_, i) => (
                <BlogCardSkeleton key={i} isCompact={true} />
            ))}
        </div>
    );
}

export function BlogHeaderSkeleton() {
    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" /> {/* Title */}
                <Skeleton className="h-10 w-32 rounded-md" /> {/* New Post Button */}
            </div>
            <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-64 rounded-md" /> {/* Search */}
                <Skeleton className="h-10 w-32 rounded-md" /> {/* Filter */}
                <Skeleton className="h-10 w-32 rounded-md" /> {/* Sort */}
            </div>
        </div>
    );
}

export function BlogDetailSkeleton() {
    return (
        <article className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" /> {/* Title */}
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" /> {/* Date */}
                    <Skeleton className="h-4 w-24" /> {/* Category */}
                </div>
            </div>

            {/* Cover Image */}
            <Skeleton className="w-full aspect-video rounded-lg" />

            {/* Content */}
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ))}
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
            </div>
        </article>
    );
}

const BlogSkeletonComponent = {
    BlogCardSkeleton,
    BlogGridSkeleton,
    BlogListSkeleton,
    BlogHeaderSkeleton,
    BlogDetailSkeleton,
};

export default BlogSkeletonComponent; 