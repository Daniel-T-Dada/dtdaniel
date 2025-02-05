import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Projects Collection
export async function getProjects() {
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            // If project is marked as private, override the GitHub URL
            if (data.isPrivate) {
                return {
                    id: doc.id,
                    ...data,
                    githubUrl: "private", // Override the GitHub URL for private projects
                };
            }
            return {
                id: doc.id,
                ...data,
            };
        });
    } catch (error) {
        console.error("Error getting projects:", error);
        throw error;
    }
}

export async function addProject(projectData) {
    try {
        const projectsRef = collection(db, "projects");
        const docRef = await addDoc(projectsRef, {
            ...projectData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error;
    }
}

export async function updateProject(projectId, projectData) {
    try {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
            ...projectData,
            updatedAt: new Date(),
        });
        return true;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
}

// Skills Collection
export async function getSkills() {
    try {
        const skillsRef = collection(db, "skills");
        const q = query(skillsRef, orderBy("category"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error getting skills:", error);
        throw error;
    }
}

export async function addSkill(skillData) {
    try {
        const skillsRef = collection(db, "skills");
        const docRef = await addDoc(skillsRef, {
            ...skillData,
            createdAt: new Date(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding skill:", error);
        throw error;
    }
}

// Contact Messages Collection
export const addContactMessage = async (messageData) => {
    try {
        const messagesRef = collection(db, "messages");
        const docRef = await addDoc(messagesRef, {
            ...messageData,
            timestamp: serverTimestamp(),
            status: "unread",
        });

        // Send email notification using Firebase Cloud Functions
        try {
            const response = await fetch("/api/notify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messageId: docRef.id,
                    ...messageData,
                }),
            });

            if (!response.ok) {
                console.error("Failed to send email notification");
            }
        } catch (error) {
            console.error("Error sending email notification:", error);
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding message:", error);
        return { success: false, error: error.message };
    }
};

// About Collection
export async function getAboutInfo() {
    try {
        const aboutRef = collection(db, "about");
        const querySnapshot = await getDocs(aboutRef);
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        };
    } catch (error) {
        console.error("Error getting about info:", error);
        throw error;
    }
}

export async function updateAboutInfo(id, aboutData) {
    try {
        const docRef = doc(db, "about", id);
        await updateDoc(docRef, {
            ...aboutData,
            updatedAt: new Date(),
        });
        return true;
    } catch (error) {
        console.error("Error updating about info:", error);
        throw error;
    }
}

// Generic helper functions
export async function getDocumentById(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // If project is marked as private, override the GitHub URL
            if (collectionName === "projects" && data.isPrivate) {
                return {
                    id: docSnap.id,
                    ...data,
                    githubUrl: "private", // Override the GitHub URL for private projects
                };
            }
            return {
                id: docSnap.id,
                ...data,
            };
        }
        return null;
    } catch (error) {
        console.error(`Error getting ${collectionName} document:`, error);
        throw error;
    }
}

export async function deleteDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(`Error deleting ${collectionName} document:`, error);
        throw error;
    }
}

// Message status management
export const updateMessageStatus = async (messageId, status) => {
    try {
        const messageRef = doc(db, "messages", messageId);
        await updateDoc(messageRef, {
            status,
            lastUpdated: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating message status:", error);
        return { success: false, error: error.message };
    }
};

// Reply to message
export const addMessageReply = async (messageId, replyData) => {
    try {
        // Validate input data
        if (!messageId || !replyData || !replyData.content || !replyData.adminEmail) {
            throw new Error("Missing required data for reply");
        }

        const messageRef = doc(db, "messages", messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error("Message not found");
        }

        // Get existing replies or initialize empty array
        const currentData = messageDoc.data();
        const replies = Array.isArray(currentData.replies) ? currentData.replies : [];

        // Create new reply object with all required fields
        const newReply = {
            content: replyData.content.trim(),
            timestamp: new Date().toISOString(), // Store as ISO string for consistency
            adminEmail: replyData.adminEmail,
        };

        // Create update object with all fields explicitly defined
        const updateData = {
            replies: [...replies, newReply],
            status: "replied",
            lastUpdated: serverTimestamp(),
        };

        // Update document with validated data
        await updateDoc(messageRef, updateData);

        // Send email notification of reply
        try {
            const response = await fetch("/api/reply-notify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messageId,
                    reply: replyData.content,
                    recipientEmail: currentData.email,
                    recipientName: currentData.name,
                }),
            });

            if (!response.ok) {
                console.error("Failed to send reply notification email");
            }
        } catch (error) {
            console.error("Error sending reply notification:", error);
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding reply:", error);
        return { success: false, error: error.message };
    }
};

// Get message replies
export const getMessageReplies = async (messageId) => {
    try {
        const messageRef = doc(db, "messages", messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error("Message not found");
        }

        return messageDoc.data().replies || [];
    } catch (error) {
        console.error("Error getting replies:", error);
        return [];
    }
};

export const getUnreadMessagesCount = async () => {
    try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("status", "==", "unread"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error getting unread messages count:", error);
        return 0;
    }
};
