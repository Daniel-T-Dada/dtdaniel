import { BlogDetailSkeleton } from './common/BlogSkeleton';

export default function BlogDetail({ isLoading = false }) {
    if (isLoading) {
        return <BlogDetailSkeleton />;
    }

    return (
        // ... existing code ...
    );
} 