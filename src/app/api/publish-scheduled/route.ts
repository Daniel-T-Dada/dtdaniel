import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Verify API key or Cron Secret
        const authHeader = request.headers.get('authorization');
        // Support both Bearer token and direct Cron header if applicable, but existing code check for Bearer
        if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error('Unauthorized attempt to publish scheduled posts');
            return NextResponse.json({
                error: 'Unauthorized',
                message: 'Invalid or missing authorization token'
            }, {
                status: 401
            });
        }

        // Log the start of the publishing process
        console.log('Starting scheduled posts check:', new Date().toISOString());

        const now = new Date();
        const postsRef = db.collection('blog-posts');

        // Query for scheduled posts that are due
        const snapshot = await postsRef
            .where('status', '==', 'scheduled')
            .where('scheduledFor', '<=', now)
            .get();

        const publishedCount = snapshot.size;

        if (publishedCount > 0) {
            const batch = db.batch();

            snapshot.docs.forEach(doc => {
                const postRef = postsRef.doc(doc.id);
                batch.update(postRef, {
                    status: 'published',
                    published: true,
                    publishedAt: new Date(),
                    updatedAt: new Date()
                });
            });

            await batch.commit();
        }

        // Log the results
        console.log(`Completed scheduled posts check. Published ${publishedCount} posts:`, new Date().toISOString());

        return NextResponse.json({
            success: true,
            publishedCount,
            timestamp: new Date().toISOString(),
            message: `Successfully published ${publishedCount} scheduled posts`
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            },
        });
    } catch (error: any) {
        // Log the error details
        console.error('Error in publish-scheduled API:', error);

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            },
        });
    }
} 
