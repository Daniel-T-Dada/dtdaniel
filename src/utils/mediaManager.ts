import { getStorage, ref, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, getDocs, query, where, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

const storage = getStorage();
const MEDIA_COLLECTION = 'media-library';

export interface MediaLibraryItem {
    id: string;
    type: string;
    fileName: string;
    url: string;
    thumbnailUrl?: string;
    tags?: string[];
    caption?: string;
    uploadedAt: string | null;
    updatedAt: string | null;
    [key: string]: any;
}

export interface MediaMetadata {
    [key: string]: any;
}

// Upload media with optimization
export async function uploadMedia(file: File, metadata: MediaMetadata = {}): Promise<any> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('User not authenticated');

        const token = await currentUser.getIdToken();
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

export interface MediaFilters {
    type?: string;
    tags?: string[];
}

// Get media library items
export async function getMediaLibrary(filters: MediaFilters = {}): Promise<MediaLibraryItem[]> {
    try {
        let mediaQuery = query(collection(db, MEDIA_COLLECTION));

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
            } as MediaLibraryItem;
        });
    } catch (error) {
        console.error('Error getting media library:', error);
        // Add more specific error handling
        if ((error as any).code === 'permission-denied') {
            throw new Error('Permission denied: Unable to access media library');
        }
        throw error;
    }
}

// Delete media item
export async function deleteMedia(mediaId: string, fileName: string): Promise<boolean> {
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
export async function updateMediaMetadata(mediaId: string, metadata: MediaMetadata): Promise<boolean> {
    try {
        const mediaRef = doc(db, MEDIA_COLLECTION, mediaId);
        await setDoc(mediaRef, {
            ...metadata,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return true;
    } catch (error) {
        console.error('Error updating media metadata:', error);
        throw error;
    }
}

// Search media by tags or filename
export async function searchMedia(searchTerm: string): Promise<MediaLibraryItem[]> {
    try {
        const mediaRef = collection(db, MEDIA_COLLECTION);
        const snapshot = await getDocs(mediaRef);

        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                uploadedAt: doc.data().uploadedAt?.toDate?.()
            } as any))
            .filter(media =>
                media.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                media.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                media.caption?.toLowerCase().includes(searchTerm.toLowerCase())
            ) as MediaLibraryItem[];
    } catch (error) {
        console.error('Error searching media:', error);
        throw error;
    }
}
