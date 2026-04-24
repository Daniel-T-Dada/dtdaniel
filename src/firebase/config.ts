import { initializeApp, getApps } from "firebase/app";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (!apiKey) throw new Error('Missing required Firebase environment variable: NEXT_PUBLIC_FIREBASE_API_KEY');
if (!authDomain) throw new Error('Missing required Firebase environment variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!projectId) throw new Error('Missing required Firebase environment variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!storageBucket) throw new Error('Missing required Firebase environment variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!appId) throw new Error('Missing required Firebase environment variable: NEXT_PUBLIC_FIREBASE_APP_ID');

const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
