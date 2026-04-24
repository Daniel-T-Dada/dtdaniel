import { Timestamp } from 'firebase/firestore';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    published: boolean;
    featured?: boolean;
    tags?: string[];
    author?: {
        name: string;
        avatar?: string;
    };
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
    scheduledFor?: Timestamp | string | null;
    media?: Array<{
        url: string;
        type: string;
        name?: string;
    }>;
    readingTime?: number;
    status?: 'published' | 'draft' | 'scheduled';
    category?: string;
}
