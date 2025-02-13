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
    deleteDoc
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

// Create a new draft
export async function createDraft(postData) {
    try {
        const draftRef = doc(collection(db, COLLECTIONS.DRAFTS));
        const draftId = draftRef.id;

        // Create initial version
        const versionData = {
            ...postData,
            draftId,
            version: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Save the draft and its first version
        await Promise.all([
            setDoc(draftRef, {
                ...postData,
                currentVersion: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                expiresAt: null // Set expiration if needed
            }),
            addDoc(collection(db, COLLECTIONS.DRAFT_VERSIONS), versionData)
        ]);

        return draftId;
    } catch (error) {
        console.error('Error creating draft:', error);
        throw error;
    }
}

// Update a draft and create new version
export async function updateDraft(draftId, postData) {
    try {
        const draftRef = doc(db, COLLECTIONS.DRAFTS, draftId);
        const draftDoc = await getDoc(draftRef);

        if (!draftDoc.exists()) {
            throw new Error('Draft not found');
        }

        const currentData = draftDoc.data();
        const newVersion = (currentData.currentVersion || 0) + 1;

        // Create new version
        const versionData = {
            ...postData,
            draftId,
            version: newVersion,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Update draft and add new version
        await Promise.all([
            setDoc(draftRef, {
                ...postData,
                currentVersion: newVersion,
                updatedAt: serverTimestamp()
            }, { merge: true }),
            addDoc(collection(db, COLLECTIONS.DRAFT_VERSIONS), versionData)
        ]);

        return newVersion;
    } catch (error) {
        console.error('Error updating draft:', error);
        throw error;
    }
}

// Get draft versions
export async function getDraftVersions(draftId) {
    try {
        const versionsRef = collection(db, COLLECTIONS.DRAFT_VERSIONS);
        const q = query(
            versionsRef,
            where('draftId', '==', draftId),
            orderBy('version', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting draft versions:', error);
        throw error;
    }
}

// Create a share link for a draft
export async function createDraftShare(draftId, expiresIn = 7) { // Default 7 days
    try {
        const shareToken = nanoid(12); // Generate a secure token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresIn);

        await setDoc(doc(db, COLLECTIONS.DRAFT_SHARES, shareToken), {
            draftId,
            createdAt: serverTimestamp(),
            expiresAt,
            isRevoked: false
        });

        return shareToken;
    } catch (error) {
        console.error('Error creating share link:', error);
        throw error;
    }
}

// Verify a share token
export async function verifyShareToken(token) {
    try {
        const shareRef = doc(db, COLLECTIONS.DRAFT_SHARES, token);
        const shareDoc = await getDoc(shareRef);

        if (!shareDoc.exists()) {
            return { valid: false, reason: 'Token not found' };
        }

        const shareData = shareDoc.data();
        const now = new Date();

        if (shareData.isRevoked) {
            return { valid: false, reason: 'Share link has been revoked' };
        }

        if (shareData.expiresAt.toDate() < now) {
            return { valid: false, reason: 'Share link has expired' };
        }

        return { valid: true, draftId: shareData.draftId };
    } catch (error) {
        console.error('Error verifying share token:', error);
        return { valid: false, reason: 'Error verifying token' };
    }
}

// Revoke a share link
export async function revokeDraftShare(token) {
    try {
        const shareRef = doc(db, COLLECTIONS.DRAFT_SHARES, token);
        await setDoc(shareRef, { isRevoked: true }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error revoking share link:', error);
        throw error;
    }
}

// Get draft by ID
export async function getDraft(draftId) {
    try {
        const draftRef = doc(db, COLLECTIONS.DRAFTS, draftId);
        const draftDoc = await getDoc(draftRef);

        if (!draftDoc.exists()) {
            return null;
        }

        return {
            id: draftDoc.id,
            ...draftDoc.data()
        };
    } catch (error) {
        console.error('Error getting draft:', error);
        throw error;
    }
}

// Delete a draft and all its versions
export async function deleteDraft(draftId) {
    try {
        // Get all versions
        const versions = await getDraftVersions(draftId);

        // Delete all versions and the draft
        const deletePromises = [
            deleteDoc(doc(db, COLLECTIONS.DRAFTS, draftId)),
            ...versions.map(version =>
                deleteDoc(doc(db, COLLECTIONS.DRAFT_VERSIONS, version.id))
            )
        ];

        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error('Error deleting draft:', error);
        throw error;
    }
}

// Set draft expiration
export async function setDraftExpiration(draftId, expiresIn = 30) { // Default 30 days
    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresIn);

        await setDoc(doc(db, COLLECTIONS.DRAFTS, draftId), {
            expiresAt,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return true;
    } catch (error) {
        console.error('Error setting draft expiration:', error);
        throw error;
    }
} 