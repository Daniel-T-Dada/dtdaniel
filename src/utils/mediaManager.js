import { getStorage, ref, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, getDocs, query, where, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

const storage = getStorage();
const MEDIA_COLLECTION = 'media-library';

// Upload media with optimization
export async function uploadMedia(file, metadata = {}) {
    try {
        const token = await auth.currentUser.getIdToken();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch('/api/media/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading media:', error);
        throw error;
    }
}

// Get media library items
export async function getMediaLibrary(filters = {}) {
    try {
        let mediaQuery = collection(db, MEDIA_COLLECTION);

        // Apply filters if provided
        if (filters.type) {
            mediaQuery = query(mediaQuery, where('type', '==', filters.type));
        }
        if (filters.tags && filters.tags.length > 0) {
            mediaQuery = query(mediaQuery, where('tags', 'array-contains-any', filters.tags));
        }

        // Get the documents
        const snapshot = await getDocs(mediaQuery);

        // Map the documents to their data and convert timestamps to ISO strings
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
            };
        });
    } catch (error) {
        console.error('Error getting media library:', error);
        // Add more specific error handling
        if (error.code === 'permission-denied') {
            throw new Error('Permission denied: Unable to access media library');
        }
        throw error;
    }
}

// Delete media item
export async function deleteMedia(mediaId, fileName) {
    try {
        if (!mediaId || !fileName) {
            console.error('Missing required parameters:', { mediaId, fileName });
            throw new Error('Media ID and filename are required');
        }

        // Reference to the document in Firestore
        const mediaRef = doc(db, MEDIA_COLLECTION, mediaId);

        // Reference to the files in Storage
        const imageRef = ref(storage, `media/${fileName}`);
        const thumbnailRef = ref(storage, `media/thumbnails/${fileName}`);

        // Delete both the files and the document
        await Promise.all([
            deleteObject(imageRef).catch(error => {
                console.warn('Error deleting image file:', error);
                // Continue with deletion even if file doesn't exist
            }),
            deleteObject(thumbnailRef).catch(error => {
                console.warn('Error deleting thumbnail file:', error);
                // Continue with deletion even if thumbnail doesn't exist
            }),
            deleteDoc(mediaRef)
        ]);

        return true;
    } catch (error) {
        console.error('Error deleting media:', error);
        throw error;
    }
}

// Update media metadata
export async function updateMediaMetadata(mediaId, metadata) {
    try {
        const mediaRef = doc(db, MEDIA_COLLECTION, mediaId);
        await mediaRef.update({
            ...metadata,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating media metadata:', error);
        throw error;
    }
}

// Search media by tags or filename
export async function searchMedia(searchTerm) {
    try {
        const mediaRef = collection(db, MEDIA_COLLECTION);
        const snapshot = await getDocs(mediaRef);

        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                uploadedAt: doc.data().uploadedAt?.toDate?.()
            }))
            .filter(media =>
                media.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                media.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                media.caption?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    } catch (error) {
        console.error('Error searching media:', error);
        throw error;
    }
} 