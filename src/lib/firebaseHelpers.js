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
} from "firebase/firestore";
import { db } from "./firebase";

// Projects Collection
export async function getProjects() {
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
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
export async function submitContactMessage(messageData) {
    try {
        const messagesRef = collection(db, "messages");
        const docRef = await addDoc(messagesRef, {
            ...messageData,
            createdAt: new Date(),
            status: "unread",
        });
        return docRef.id;
    } catch (error) {
        console.error("Error submitting message:", error);
        throw error;
    }
}

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
            return {
                id: docSnap.id,
                ...docSnap.data(),
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
