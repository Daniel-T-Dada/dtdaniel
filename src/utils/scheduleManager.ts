import { db, COLLECTIONS } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { BlogPost } from '@/lib/firebaseHelpers';

// Create a scheduled post
export async function schedulePost(postData: Partial<BlogPost>, publishDate: Date) {
    try {
        const scheduledRef = doc(collection(db, COLLECTIONS.BLOG_POSTS));
        const postId = scheduledRef.id;

        const scheduleData = {
            ...postData,
            id: postId,
            scheduledFor: Timestamp.fromDate(publishDate),
            status: 'scheduled',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            published: false
        };

        await setDoc(scheduledRef, scheduleData);
        return postId;
    } catch (error) {
        console.error('Error scheduling post:', error);
        throw error;
    }
}

// Get all scheduled posts
export async function getScheduledPosts() {
    try {
        const postsRef = collection(db, COLLECTIONS.BLOG_POSTS);
        const q = query(
            postsRef,
            where('status', '==', 'scheduled'),
            orderBy('scheduledFor', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledFor: doc.data().scheduledFor?.toDate?.()
        }));
    } catch (error) {
        console.error('Error getting scheduled posts:', error);
        throw error;
    }
}

// Update scheduled post
export async function updateScheduledPost(postId: string, postData: Partial<BlogPost>, publishDate?: Date) {
    try {
        const postRef = doc(db, COLLECTIONS.BLOG_POSTS, postId);
        const scheduleData: any = {
            ...postData,
            updatedAt: serverTimestamp()
        };

        if (publishDate) {
            scheduleData.scheduledFor = Timestamp.fromDate(publishDate);
        }

        await setDoc(postRef, scheduleData, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating scheduled post:', error);
        throw error;
    }
}

// Cancel scheduled post
export async function cancelScheduledPost(postId: string) {
    try {
        const postRef = doc(db, COLLECTIONS.BLOG_POSTS, postId);
        await setDoc(postRef, {
            status: 'draft',
            scheduledFor: null,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error canceling scheduled post:', error);
        throw error;
    }
}

// Get publishing queue
export async function getPublishingQueue() {
    try {
        const postsRef = collection(db, COLLECTIONS.BLOG_POSTS);
        const q = query(
            postsRef,
            where('status', '==', 'scheduled'),
            orderBy('scheduledFor', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledFor: doc.data().scheduledFor?.toDate?.()
        }));
    } catch (error) {
        console.error('Error getting publishing queue:', error);
        throw error;
    }
}
