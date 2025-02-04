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
import Image from "next/image";

export default function NotificationManager() {
    const [user, setUser] = useState(null);

    const setupPushNotifications = useCallback(async () => {
        try {
            // Get the current user's ID token
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }
            const idToken = await user.getIdToken();

            // Exchange ID token for OAuth token
            const tokenResponse = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken,
                })
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                throw new Error(`Failed to get OAuth token: ${JSON.stringify(errorData)}`);
            }

            const { access_token } = await tokenResponse.json();

            // Rest of your existing push notification setup code...
            const registration = await registerServiceWorker();
            const messaging = getMessaging(app);
            const fcmToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            // Update FCM token with the access token
            await updateToken(fcmToken, access_token);
        } catch (error) {
            console.error('Error setting up push notifications:', error);
            toast.error('Failed to set up notifications');
        }
    }, []);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await setupPushNotifications();
            }
        });

        return () => unsubscribe();
    }, [setupPushNotifications]);

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

    return null; // This component doesn't render anything
}
