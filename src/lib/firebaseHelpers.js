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
            // Mark specific projects as private
            if (
                data.title === "GidiGo" ||
                data.title === "GidiGo Travel Platform" ||
                data.title === "Chronicle Blog"
            ) {
                return {
                    id: doc.id,
                    ...data,
                    githubUrl: "private", // Override the GitHub URL
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
            // Mark specific projects as private
            if (
                collectionName === "projects" &&
                (data.title === "GidiGo" ||
                    data.title === "GidiGo Travel Platform" ||
                    data.title === "Chronicle Blog")
            ) {
                return {
                    id: docSnap.id,
                    ...data,
                    githubUrl: "private", // Override the GitHub URL
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
