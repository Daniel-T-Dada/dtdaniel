import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getStorage } from 'firebase-admin/storage';
import { db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request) {
    try {
        // Verify admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await getAuth().verifyIdToken(token);
            if (decodedToken.email !== process.env.ADMIN_EMAIL) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const metadata = JSON.parse(formData.get('metadata') || '{}');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate optimized image
        const optimizedBuffer = await sharp(buffer)
            .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer();

        // Generate thumbnail
        const thumbnailBuffer = await sharp(buffer)
            .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer();

        const storage = getStorage();
        const fileName = `${Date.now()}-${file.name}`;
        const bucket = storage.bucket();

        // Upload optimized image and thumbnail
        const [imageFile, thumbnailFile] = await Promise.all([
            bucket.file(`media/${fileName}`).save(optimizedBuffer, {
                metadata: {
                    contentType: file.type,
                    metadata: metadata
                }
            }),
            bucket.file(`media/thumbnails/${fileName}`).save(thumbnailBuffer, {
                metadata: {
                    contentType: file.type
                }
            })
        ]);

        // Get public URLs
        const [imageUrl, thumbnailUrl] = await Promise.all([
            bucket.file(`media/${fileName}`).getSignedUrl({
                action: 'read',
                expires: '01-01-2100'
            }),
            bucket.file(`media/thumbnails/${fileName}`).getSignedUrl({
                action: 'read',
                expires: '01-01-2100'
            })
        ]);

        // Save to Firestore
        const mediaDoc = await db.collection('media-library').add({
            fileName,
            originalName: file.name,
            type: file.type,
            size: optimizedBuffer.length,
            url: imageUrl[0],
            thumbnailUrl: thumbnailUrl[0],
            metadata,
            uploadedAt: new Date(),
            caption: metadata.caption || '',
            altText: metadata.altText || '',
            tags: metadata.tags || []
        });

        return NextResponse.json({
            id: mediaDoc.id,
            url: imageUrl[0],
            thumbnailUrl: thumbnailUrl[0],
            fileName
        });
    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json(
            { error: 'Error uploading media' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 