import { db, COLLECTIONS } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// Create a scheduled post
export async function schedulePost(postData, publishDate) {
    try {
        const scheduledRef = doc(collection(db, COLLECTIONS.BLOG_POSTS));
        const postId = scheduledRef.id;

        const scheduleData = {
            ...postData,
            id: postId,
            scheduledFor: Timestamp.fromDate(new Date(publishDate)),
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
export async function updateScheduledPost(postId, postData, publishDate) {
    try {
        const postRef = doc(db, COLLECTIONS.BLOG_POSTS, postId);
        const scheduleData = {
            ...postData,
            scheduledFor: publishDate ? Timestamp.fromDate(new Date(publishDate)) : undefined,
            updatedAt: serverTimestamp()
        };

        await setDoc(postRef, scheduleData, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating scheduled post:', error);
        throw error;
    }
}

// Cancel scheduled post
export async function cancelScheduledPost(postId) {
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

// Check and publish scheduled posts
export async function checkAndPublishScheduledPosts() {
    try {
        const now = new Date();
        const postsRef = collection(db, COLLECTIONS.BLOG_POSTS);
        const q = query(
            postsRef,
            where('status', '==', 'scheduled'),
            where('scheduledFor', '<=', now)
        );

        const snapshot = await getDocs(q);
        const publishPromises = snapshot.docs.map(doc => {
            const postRef = doc.ref;
            return setDoc(postRef, {
                status: 'published',
                published: true,
                publishedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });
        });

        await Promise.all(publishPromises);
        return snapshot.docs.length; // Return number of published posts
    } catch (error) {
        console.error('Error publishing scheduled posts:', error);
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