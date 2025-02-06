"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported,
    deleteToken
} from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/config";
import { notify } from "@/utils/toast";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// Constants for token refresh and retry attempts
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-indigo-500" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}

export default function NotificationManager() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [retryAttempts, setRetryAttempts] = useState(0);
    const [lastTokenRefresh, setLastTokenRefresh] = useState(Date.now());

    // Set mounted to true when component mounts
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Production logging utility
    const logToProduction = useCallback((type, message, error = null) => {
        const logData = {
            timestamp: new Date().toISOString(),
            type,
            message,
            error: error ? {
                message: error.message,
                code: error.code,
                stack: error.stack
            } : null,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console[type](`[FCM ${type}]:`, message, error || '');
            return;
        }

        // In production, store logs in Firestore
        try {
            const db = getFirestore(app);
            const logsRef = doc(db, 'fcmLogs', Date.now().toString());
            setDoc(logsRef, logData);
        } catch (logError) {
            console.error('Failed to store log:', logError);
        }
    }, []);

    // Token refresh mechanism
    const refreshToken = useCallback(async () => {
        try {
            const messaging = getMessaging(app);
            await deleteToken(messaging);
            await setupPushNotifications();
            setLastTokenRefresh(Date.now());
            logToProduction('info', 'FCM token refreshed successfully');
        } catch (error) {
            logToProduction('error', 'Failed to refresh FCM token', error);
            throw error;
        }
    }, []);

    // Enhanced OAuth token retrieval with browser compatibility checks
    const getOAuthToken = async () => {
        try {
            const auth = getAuth(app);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            // First try to get the token without showing the popup
            try {
                await currentUser.getIdToken(true);
                return currentUser.accessToken;
            } catch (refreshError) {
                logToProduction('info', 'Token refresh failed, trying popup auth');
            }

            // Only show popup if we really need to
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/firebase.messaging');
            provider.addScope('https://www.googleapis.com/auth/cloud-platform');

            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);

            if (!credential?.accessToken) {
                throw new Error("Failed to get access token");
            }

            logToProduction('info', 'OAuth token retrieved successfully');
            return credential.accessToken;
        } catch (error) {
            logToProduction('error', 'Error getting OAuth token', error);
            if (error.code === 'auth/cancelled-popup-request') {
                notify.error('Authentication popup was cancelled');
            }
            throw error;
        }
    };

    // Enhanced setup with retry mechanism and error recovery
    const setupPushNotifications = useCallback(async (isRetry = false) => {
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
                logToProduction('error', 'Service worker registration error', swError);
                throw swError;
            }

            // Get messaging instance
            const messaging = getMessaging(app);

            // Try to get existing token first
            try {
                const existingToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                if (existingToken) {
                    // Token exists, no need to get a new one
                    logToProduction('info', 'Using existing FCM token');
                    return;
                }
            } catch (tokenError) {
                logToProduction('info', 'No existing token found, will create new one');
            }

            // Only proceed with OAuth and new token if we don't have a valid one
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            // Get current ID token without popup
            const idToken = await user.getIdToken(true);

            // Get new FCM token
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
                logToProduction('error', 'FCM token error', tokenError);
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
                    lastTokenRefresh: Date.now()
                }, { merge: true });

                // Call the Cloud Function to update the token
                try {
                    const functions = getFunctions(app);
                    const updateFCMToken = httpsCallable(functions, 'updateFCMToken');
                    await updateFCMToken({
                        token: fcmToken,
                        action: 'add'
                    });
                } catch (functionError) {
                    logToProduction('error', 'Failed to update FCM token in cloud function', functionError);
                    // Don't throw here, as the token is already stored in Firestore
                }

                // Reset retry attempts on success
                setRetryAttempts(0);
                window.pushNotificationsSetup = true;
            } catch (dbError) {
                logToProduction('error', 'Firestore error', dbError);
                throw dbError;
            }

            notify.success('Notifications set up successfully');
            setShowNotificationPrompt(false);

            // Handle foreground messages
            onMessage(messaging, (payload) => {
                logToProduction('info', 'Received foreground message', payload);
                notify.success(payload.notification.title);
            });

        } catch (error) {
            logToProduction('error', 'Error setting up push notifications', error);

            // Only retry for specific errors that might be temporary
            const retryableErrors = ['auth/network-request-failed', 'INTERNAL'];
            if (!isRetry && retryAttempts < MAX_RETRY_ATTEMPTS && retryableErrors.includes(error.code)) {
                setRetryAttempts(prev => prev + 1);
                setTimeout(() => {
                    setupPushNotifications(true);
                }, RETRY_DELAY);
            } else {
                window.pushNotificationsSetup = false;
                if (!error.message.includes('cancelled')) {
                    notify.error(error.message || 'Failed to set up notifications');
                }
                throw error;
            }
        }
    }, [retryAttempts, logToProduction]);

    // Monitor permission changes
    useEffect(() => {
        if (!mounted) return;

        const handlePermissionChange = () => {
            if (Notification.permission === 'granted') {
                setupPushNotifications();
            } else if (Notification.permission === 'denied') {
                notify.error('Notification permission denied');
            }
        };

        // Check if the browser supports the permissions API
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'notifications' })
                .then(permissionStatus => {
                    permissionStatus.onchange = handlePermissionChange;
                });
        }

        return () => {
            // Cleanup permission listener if needed
        };
    }, [mounted, setupPushNotifications]);

    // Token refresh interval
    useEffect(() => {
        if (!mounted || !user) return;

        const tokenRefreshInterval = setInterval(() => {
            if (Date.now() - lastTokenRefresh >= TOKEN_REFRESH_INTERVAL) {
                refreshToken();
            }
        }, TOKEN_REFRESH_INTERVAL);

        return () => clearInterval(tokenRefreshInterval);
    }, [mounted, user, lastTokenRefresh, refreshToken]);

    // Rest of the component remains the same...
    const handleNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await setupPushNotifications();
            } else {
                throw new Error('Notification permission not granted');
            }
        } catch (error) {
            logToProduction('error', 'Permission request error', error);
            notify.error('Failed to set up notifications');
        }
    };

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                    scope: '/'
                });
                logToProduction('info', 'Service Worker registered', { scope: registration.scope });
                return registration;
            } catch (error) {
                logToProduction('error', 'Service Worker registration failed', error);
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
            // Only attempt to set up push notifications if:
            // 1. User is authenticated
            // 2. Notification permission is already granted
            // 3. We haven't set up notifications yet
            if (user &&
                Notification.permission === 'granted' &&
                !window.pushNotificationsSetup) {
                try {
                    window.pushNotificationsSetup = true;
                    await setupPushNotifications();
                } catch (error) {
                    logToProduction('error', 'Failed to set up push notifications', error);
                    window.pushNotificationsSetup = false;
                }
            }
        });

        return () => {
            unsubscribe();
            window.pushNotificationsSetup = false;
        };
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
