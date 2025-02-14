'use client';

import { Skeleton } from './Skeleton';

export function InputSkeleton({ label = true, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && <Skeleton className="h-5 w-24" />}
            <Skeleton className="h-10 w-full rounded-md" />
        </div>
    );
}

export function TextAreaSkeleton({ label = true, rows = 3, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && <Skeleton className="h-5 w-24" />}
            <Skeleton className={`w-full rounded-md h-${rows * 8}`} />
        </div>
    );
}

export function RichEditorSkeleton({ className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Skeleton className="h-5 w-24" />
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <Skeleton className="h-10 w-full" /> {/* Toolbar */}
                <Skeleton className="h-96 w-full" /> {/* Editor area */}
            </div>
        </div>
    );
}

export function FormSectionSkeleton({ className = '' }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 space-y-4 ${className}`}>
            <InputSkeleton />
        </div>
    );
}

export function BlogFormSkeleton() {
    return (
        <div className="space-y-6 max-w-[95vw] lg:max-w-none mx-auto">
            {/* Title Section */}
            <FormSectionSkeleton />

            {/* Cover Image & Category Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <FormSectionSkeleton />
                <FormSectionSkeleton />
            </div>

            {/* Excerpt Section */}
            <FormSectionSkeleton />

            {/* Content Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 space-y-4">
                <RichEditorSkeleton />
            </div>

            {/* Tags Section */}
            <FormSectionSkeleton />

            {/* Schedule Section */}
            <FormSectionSkeleton />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <Skeleton className="w-full sm:w-24 h-10 rounded-md" />
                <Skeleton className="w-full sm:w-32 h-10 rounded-md" />
            </div>
        </div>
    );
}

// Default export for backward compatibility
const FormSkeletonComponent = {
    InputSkeleton,
    TextAreaSkeleton,
    RichEditorSkeleton,
    FormSectionSkeleton,
    BlogFormSkeleton,
};
export default FormSkeletonComponent; 