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

            // Log user ID for configuration
            console.log('Admin User ID:', user.uid);
            console.log('Admin Email:', user.email);

            // Check if messaging is supported
            console.log('Checking messaging support...');
            const isMessagingSupported = await isSupported();
            if (!isMessagingSupported) {
                throw new Error("Push notifications are not supported in this browser");
            }
            console.log('Messaging is supported');

            // Check if notification permission is granted
            console.log('Checking notification permission...');
            if (Notification.permission === 'denied') {
                throw new Error('Notification permission denied by user');
            }
            if (Notification.permission === 'default') {
                console.log('Requesting notification permission...');
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Notification permission not granted');
                }
            }
            console.log('Notification permission granted');

            // Register service worker
            console.log('Registering service worker...');
            let registration;
            try {
                registration = await registerServiceWorker();
                console.log('Service worker registered successfully with scope:', registration.scope);

                // Check if the service worker is active
                if (!registration.active) {
                    console.log('Waiting for service worker to activate...');
                    await new Promise((resolve) => {
                        registration.addEventListener('activate', () => resolve(), { once: true });
                    });
                }
            } catch (swError) {
                console.error('Service worker registration error:', {
                    name: swError.name,
                    message: swError.message,
                    stack: swError.stack
                });
                throw swError;
            }

            // Initialize messaging and get FCM token
            console.log('Initializing messaging...');
            const messaging = getMessaging(app);
            console.log('Getting FCM token with VAPID key:', process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.slice(0, 10) + '...');

            let fcmToken;
            try {
                fcmToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });
            } catch (tokenError) {
                console.error('FCM token error:', {
                    name: tokenError.name,
                    message: tokenError.message,
                    stack: tokenError.stack,
                    code: tokenError.code,
                    details: tokenError.details
                });
                throw tokenError;
            }

            if (!fcmToken) {
                throw new Error("Failed to get FCM token");
            }
            console.log('FCM token obtained successfully');

            // Store the FCM token in Firestore
            console.log('Storing FCM token in Firestore...');
            try {
                const db = getFirestore(app);
                const userRef = doc(db, 'adminUsers', user.uid);
                await setDoc(userRef, {
                    fcmTokens: [fcmToken],
                    lastUpdated: new Date(),
                    email: user.email
                }, { merge: true });
                console.log('FCM token stored in Firestore successfully');
            } catch (dbError) {
                console.error('Firestore error:', {
                    name: dbError.name,
                    message: dbError.message,
                    stack: dbError.stack,
                    code: dbError.code
                });
                throw dbError;
            }

            toast.success('Notifications set up successfully');

            // Handle foreground messages
            onMessage(messaging, (payload) => {
                console.log('Received foreground message:', payload);
                toast.success(payload.notification.title, {
                    description: payload.notification.body
                });
            });

        } catch (error) {
            console.error('Error setting up push notifications:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details
            });
            toast.error(error.message || 'Failed to set up notifications');
            throw error; // Re-throw to handle in the calling function
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
                console.log('User signed in with ID:', user.uid);
                try {
                    await setupPushNotifications();
                } catch (error) {
                    console.error('Failed to set up push notifications:', error);
                    // If the error is due to service worker not being ready, retry after a delay
                    if (error.message?.includes('service worker')) {
                        console.log('Retrying setup in 2 seconds...');
                        setTimeout(async () => {
                            try {
                                await setupPushNotifications();
                            } catch (retryError) {
                                console.error('Retry failed:', retryError);
                            }
                        }, 2000);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [mounted, setupPushNotifications]);

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return null;
}
