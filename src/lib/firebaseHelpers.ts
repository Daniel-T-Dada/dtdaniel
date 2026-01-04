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
    serverTimestamp,
    DocumentData,
    QueryDocumentSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Interfaces
export interface Project {
    id?: string;
    title: string;
    description: string;
    imageUrl?: string;
    githubUrl?: string;
    liveUrl?: string;
    technologies?: string[];
    isPrivate?: boolean;
    order?: number;
    createdAt?: Date | Timestamp;
    updatedAt?: Date | Timestamp;
    published?: boolean;
}

export interface Skill {
    id?: string;
    name: string;
    category: string;
    icon?: string;
    level?: number;
    createdAt?: Date | Timestamp;
}

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    subject: string;
    content: string;
    status: 'unread' | 'read' | 'replied';
    timestamp?: Date | Timestamp | null;
    createdAt?: Date | Timestamp | null;
    replies?: Reply[];
    lastUpdated?: Date | Timestamp | null;
}

export type Message = ContactMessage;

export interface Reply {
    content: string;
    timestamp: string;
    adminEmail: string;
}

export interface AboutInfo {
    id?: string;
    content: string;
    imageUrl?: string;
    cvUrl?: string;
    updatedAt?: Date | Timestamp;
}

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    tags?: string[];
    category?: string;
    status: 'draft' | 'published' | 'scheduled';
    author?: {
        name: string;
        email: string;
        photoURL?: string;
    };
    seoTitle?: string;
    seoDescription?: string;
    publishedAt?: Date | Timestamp | string;
    scheduledFor?: Date | Timestamp | string;
    createdAt?: Date | Timestamp | string;
    updatedAt?: Date | Timestamp | string;
}

// Projects Collection
export async function getProjects(): Promise<Project[]> {
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data() as Project;
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

export async function addProject(projectData: Omit<Project, 'id'>): Promise<string> {
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

export async function updateProject(projectId: string, projectData: Partial<Project>): Promise<boolean> {
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
export async function getSkills(): Promise<Skill[]> {
    try {
        const skillsRef = collection(db, "skills");
        const q = query(skillsRef, orderBy("category"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
        } as Skill));
    } catch (error) {
        console.error("Error getting skills:", error);
        throw error;
    }
}

export async function addSkill(skillData: Omit<Skill, 'id'>): Promise<string> {
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
export const addContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'status' | 'timestamp' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const messagesRef = collection(db, "messages");
        const docRef = await addDoc(messagesRef, {
            ...messageData,
            status: "unread",
            timestamp: serverTimestamp(), // For compatibility with admin page
            createdAt: serverTimestamp(),
        });

        // Send email notification
        const response = await fetch("/api/notify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
        });

        if (!response.ok) {
            throw new Error("Failed to send notification");
        }

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error adding message:", error);
        return { success: false, error: error.message };
    }
};

// About Collection
export async function getAboutInfo(): Promise<AboutInfo | null> {
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
        } as AboutInfo;
    } catch (error) {
        console.error("Error getting about info:", error);
        throw error;
    }
}

export async function updateAboutInfo(id: string, aboutData: Partial<AboutInfo>): Promise<boolean> {
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
export async function getDocumentById<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // If project is marked as private, override the GitHub URL
            if (collectionName === "projects" && (data as any).isPrivate) {
                return {
                    id: docSnap.id,
                    ...data,
                    githubUrl: "private", // Override the GitHub URL for private projects
                } as T;
            }
            return {
                id: docSnap.id,
                ...data,
            } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting ${collectionName} document:`, error);
        throw error;
    }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
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
export const updateMessageStatus = async (messageId: string, status: ContactMessage['status']): Promise<{ success: boolean; error?: string }> => {
    try {
        const messageRef = doc(db, "messages", messageId);
        await updateDoc(messageRef, {
            status,
            lastUpdated: serverTimestamp(),
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error updating message status:", error);
        return { success: false, error: error.message };
    }
};

// Reply to message
export const addMessageReply = async (messageId: string, replyData: { content: string; adminEmail: string }): Promise<{ success: boolean; error?: string }> => {
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
        const currentData = messageDoc.data() as ContactMessage;
        const replies = Array.isArray(currentData.replies) ? currentData.replies : [];

        // Create new reply object with all required fields
        const newReply: Reply = {
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
    } catch (error: any) {
        console.error("Error adding reply:", error);
        return { success: false, error: error.message };
    }
};

// Get message replies
export const getMessageReplies = async (messageId: string): Promise<Reply[]> => {
    try {
        const messageRef = doc(db, "messages", messageId);
        const messageDoc = await getDoc(messageRef);

        if (!messageDoc.exists()) {
            throw new Error("Message not found");
        }

        return (messageDoc.data() as ContactMessage).replies || [];
    } catch (error) {
        console.error("Error getting replies:", error);
        return [];
    }
};

export const getUnreadMessagesCount = async (): Promise<number> => {
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
