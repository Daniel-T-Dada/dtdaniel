'use client';

export function Skeleton({ className = '', ...props }) {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
            {...props}
        />
    );
}

export function ImageSkeleton({ className = '', aspectRatio = 'aspect-video', ...props }) {
    return (
        <div className={`overflow-hidden rounded-lg ${aspectRatio} ${className}`}>
            <Skeleton className="w-full h-full" {...props} />
        </div>
    );
}

export function TextSkeleton({ lines = 1, className = '', ...props }) {
    return (
        <div className={`space-y-2 ${className}`} {...props}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 rounded ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function CardSkeleton({ className = '', ...props }) {
    return (
        <div className={`space-y-4 ${className}`} {...props}>
            <ImageSkeleton />
            <TextSkeleton lines={3} />
        </div>
    );
}

// Default export for backward compatibility
const SkeletonComponent = Skeleton;
export default SkeletonComponent; 