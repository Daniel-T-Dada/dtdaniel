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
import { notify } from "@/utils/toast";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

    const getOAuthToken = async (user) => {
        try {
            // Force refresh to get a new ID token
            const idToken = await user.getIdToken(true);

            // Get OAuth token using Google sign-in
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/firebase.messaging');

            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);

            return credential.accessToken;
        } catch (error) {
            console.error('Error getting OAuth token:', error);
            throw error;
        }
    };

    const setupPushNotifications = useCallback(async () => {
        try {
            // Check if the user is authenticated
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            // Get OAuth token
            const oauthToken = await getOAuthToken(user);
            if (!oauthToken) {
                throw new Error("Failed to get OAuth token");
            }

            // Check if messaging is supported
            const isMessagingSupported = await isSupported();
            if (!isMessagingSupported) {
                throw new Error("Push notifications are not supported in this browser");
            }

            // Check notification permission
            if (Notification.permission === 'denied') {
                throw new Error('Notification permission denied by user');
            }
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Notification permission not granted');
                }
            }

            // Register service worker
            let registration;
            try {
                registration = await registerServiceWorker();
                if (!registration.active) {
                    await new Promise((resolve) => {
                        registration.addEventListener('activate', () => resolve(), { once: true });
                    });
                }
            } catch (swError) {
                console.error('Service worker registration error:', swError);
                throw swError;
            }

            // Initialize messaging with authentication
            const messaging = getMessaging(app);
            let fcmToken;
            try {
                fcmToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                    token: oauthToken // Include OAuth token
                });

                if (!fcmToken) {
                    throw new Error("Failed to get FCM token");
                }
            } catch (tokenError) {
                console.error('FCM token error:', tokenError);
                throw tokenError;
            }

            // Store the FCM token in Firestore
            try {
                const db = getFirestore(app);
                const userRef = doc(db, 'adminUsers', user.uid);
                await setDoc(userRef, {
                    fcmTokens: [fcmToken],
                    lastUpdated: new Date(),
                    email: user.email,
                    oauthToken // Store OAuth token
                }, { merge: true });
            } catch (dbError) {
                console.error('Firestore error:', dbError);
                throw dbError;
            }

            notify.success('Notifications set up successfully');

            // Handle foreground messages
            onMessage(messaging, (payload) => {
                console.log('Received foreground message:', payload);
                notify.success(payload.notification.title);
            });

        } catch (error) {
            console.error('Error setting up push notifications:', error);
            notify.error(error.message || 'Failed to set up notifications');
            throw error;
        }
    }, []);

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                    scope: '/'
                });
                console.log('Service Worker registered with scope:', registration.scope);
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                throw error;
            }
        }
        throw new Error('Service Worker not supported');
    };

    useEffect(() => {
        if (!mounted) return;

        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    await setupPushNotifications();
                } catch (error) {
                    console.error('Failed to set up push notifications:', error);
                    if (error.message?.includes('service worker')) {
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
