import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Error initializing firebase:", error);
        throw error;
    }
} else {
    app = getApps()[0];
}

// Initialize Firestore
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Collection references
export const COLLECTIONS = {
    BLOG_POSTS: 'blog-posts',
    DRAFTS: 'blog-drafts',
    DRAFT_VERSIONS: 'draft-versions',
    DRAFT_SHARES: 'draft-shares'
};

// Export the app instance if needed elsewhere
export const firebaseApp = app;

// Test function to verify Firestore connection
export async function testFirestoreConnection(): Promise<boolean> {
    try {
        const testCollection = collection(db, "test");
        await getDocs(testCollection);
        console.log("Firestore connection successful");
        return true;
    } catch (error) {
        console.error("Firestore connection error:", error);
        return false;
    }
}

// Admin email for authentication
export const ADMIN_EMAIL = "simplytobs@gmail.com";
