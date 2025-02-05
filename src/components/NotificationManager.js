"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported,
} from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/config";
import { toast } from "react-hot-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin h-32 w-32 rounded-full border-b-2 border-indigo-500" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}

export default function NotificationManager() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const setupPushNotifications = useCallback(async () => {
        try {
            // Check if the user is authenticated
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            // Check if messaging is supported
            const isMessagingSupported = await isSupported();
            if (!isMessagingSupported) {
                throw new Error("Push notifications are not supported in this browser");
            }

            // Register service worker
            console.log('Registering service worker...');
            const registration = await registerServiceWorker();
            console.log('Service worker registered successfully');

            // Initialize messaging and get FCM token
            console.log('Getting FCM token...');
            const messaging = getMessaging(app);
            const fcmToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (!fcmToken) {
                throw new Error("Failed to get FCM token");
            }
            console.log('FCM token obtained successfully');

            // Store the FCM token in Firestore
            const db = getFirestore(app);
            const userRef = doc(db, 'adminUsers', user.uid);
            await setDoc(userRef, {
                fcmTokens: [fcmToken],
                lastUpdated: new Date()
            }, { merge: true });

            console.log('FCM token stored in Firestore');
            toast.success('Notifications set up successfully', {
                position: 'bottom-right'
            });

            // Handle foreground messages
            onMessage(messaging, (payload) => {
                console.log('Received foreground message:', payload);
                toast.success(payload.notification.title, {
                    description: payload.notification.body,
                    position: 'bottom-right'
                });
            });

        } catch (error) {
            console.error('Error setting up push notifications:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            toast.error(error.message || 'Failed to set up notifications', {
                position: 'bottom-right'
            });
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                    scope: '/'
                });
                console.log('Service Worker registered with scope:', registration.scope);
                return registration;
            }
            throw new Error('Service Worker not supported');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!mounted) return;

        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await setupPushNotifications();
            }
        });

        return () => unsubscribe();
    }, [mounted, setupPushNotifications]);

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return null;
}
