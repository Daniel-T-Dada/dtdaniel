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
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getOAuthToken = async () => {
        try {
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            // Create a new GoogleAuthProvider instance
            const provider = new GoogleAuthProvider();

            // Add the required scopes for FCM
            provider.addScope('https://www.googleapis.com/auth/firebase.messaging');
            provider.addScope('https://www.googleapis.com/auth/cloud-platform');

            // Ensure we're getting a fresh token
            provider.setCustomParameters({
                prompt: 'consent'
            });

            // Sign in with popup to get fresh OAuth credentials
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);

            if (!credential?.accessToken) {
                throw new Error("Failed to get access token");
            }

            return credential.accessToken;
        } catch (error) {
            console.error('Error getting OAuth token:', error);
            if (error.code === 'auth/popup-blocked') {
                notify.error('Please allow popups for notification setup');
            }
            throw error;
        }
    };

    const setupPushNotifications = useCallback(async () => {
        try {
            // Check if messaging is supported first
            const isMessagingSupported = await isSupported();
            if (!isMessagingSupported) {
                throw new Error("Push notifications are not supported in this browser");
            }

            // Check notification permission first
            if (Notification.permission === 'denied') {
                throw new Error('Notification permission denied by user');
            }

            // Show notification prompt if permission not granted
            if (Notification.permission === 'default') {
                setShowNotificationPrompt(true);
                return; // Wait for user interaction
            }

            // Register service worker first
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

            // Get OAuth token after service worker is ready
            const oauthToken = await getOAuthToken();
            if (!oauthToken) {
                throw new Error("Failed to get OAuth token");
            }

            // Initialize messaging with authentication
            const messaging = getMessaging(app);
            let fcmToken;
            try {
                fcmToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
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
                const auth = getAuth(app);
                const user = auth.currentUser;
                const db = getFirestore(app);
                const userRef = doc(db, 'adminUsers', user.uid);

                await setDoc(userRef, {
                    fcmTokens: [fcmToken],
                    lastUpdated: new Date(),
                    email: user.email,
                    accessToken: oauthToken
                }, { merge: true });

                // Call the Cloud Function to update the token
                const functions = getFunctions(app);
                const updateFCMToken = httpsCallable(functions, 'updateFCMToken');
                await updateFCMToken({
                    token: fcmToken,
                    action: 'add',
                    accessToken: oauthToken
                });
            } catch (dbError) {
                console.error('Firestore error:', dbError);
                throw dbError;
            }

            notify.success('Notifications set up successfully');
            setShowNotificationPrompt(false);

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

    const handleNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await setupPushNotifications();
            } else {
                throw new Error('Notification permission not granted');
            }
        } catch (error) {
            console.error('Permission request error:', error);
            notify.error('Failed to set up notifications');
        }
    };

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
            if (user && Notification.permission === 'granted') {
                try {
                    await setupPushNotifications();
                } catch (error) {
                    console.error('Failed to set up push notifications:', error);
                }
            }
        });

        return () => unsubscribe();
    }, [mounted, setupPushNotifications]);

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {showNotificationPrompt && (
                <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Would you like to enable notifications for new messages?
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowNotificationPrompt(false)}
                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Later
                        </button>
                        <button
                            onClick={handleNotificationPermission}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Enable
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
