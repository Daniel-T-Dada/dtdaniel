'use client';

import { Skeleton } from './Skeleton';

export function MediaItemSkeleton() {
    return (
        <div className="relative group">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
        </div>
    );
}

export function MediaGridSkeleton({ items = 12 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: items }).map((_, i) => (
                <MediaItemSkeleton key={i} />
            ))}
        </div>
    );
}

export function MediaSelectorSkeleton() {
    return (
        <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="w-48 h-4" />
                    <Skeleton className="w-32 h-4" />
                </div>
            </div>

            {/* Media Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex items-center justify-between gap-4">
                        <Skeleton className="w-64 h-10 rounded-md" />
                        <Skeleton className="w-32 h-10 rounded-md" />
                    </div>

                    {/* Grid */}
                    <MediaGridSkeleton />
                </div>
            </div>
        </div>
    );
}

// Default export for backward compatibility
const MediaSkeletonComponent = {
    MediaItemSkeleton,
    MediaGridSkeleton,
    MediaSelectorSkeleton,
};
export default MediaSkeletonComponent; 