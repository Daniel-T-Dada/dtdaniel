'use client';

import { BlogDetailSkeleton } from './common/BlogSkeleton';

export default function BlogDetail({ isLoading = false }) {
    if (isLoading) {
        return <BlogDetailSkeleton />;
    }

    return null; // Replace with your actual blog detail content
} 