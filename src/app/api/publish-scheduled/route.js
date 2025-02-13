import { checkAndPublishScheduledPosts } from '@/utils/scheduleManager';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Verify API key
        const authHeader = request.headers.get('authorization');
        if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error('Unauthorized attempt to publish scheduled posts');
            return new NextResponse(JSON.stringify({
                error: 'Unauthorized',
                message: 'Invalid or missing authorization token'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Log the start of the publishing process
        console.log('Starting scheduled posts check:', new Date().toISOString());

        // Check and publish scheduled posts
        const publishedCount = await checkAndPublishScheduledPosts();

        // Log the results
        console.log(`Completed scheduled posts check. Published ${publishedCount} posts:`, new Date().toISOString());

        return new NextResponse(JSON.stringify({
            success: true,
            publishedCount,
            timestamp: new Date().toISOString(),
            message: `Successfully published ${publishedCount} scheduled posts`
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            },
        });
    } catch (error) {
        // Log the error details
        console.error('Error in publish-scheduled API:', error);

        return new NextResponse(JSON.stringify({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            },
        });
    }
} 