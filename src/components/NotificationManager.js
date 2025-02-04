"use client";

import { useEffect } from "react";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase/config";
import { toast } from "react-hot-toast";

export default function NotificationManager() {
  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        // Check if Firebase Messaging is supported
        const isMessagingSupported = await isSupported();
        if (!isMessagingSupported) {
          console.log(
            "Firebase Messaging is not supported in this environment"
          );
          return;
        }

        const messaging = getMessaging(app);
        const functions = getFunctions(app);
        const updateFCMToken = httpsCallable(functions, "updateFCMToken");

        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          try {
            // Get new token
            const token = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (token) {
              // Register token with your server
              await updateFCMToken({ token, action: "add" });

              // Handle token refresh
              messaging.onTokenRefresh(async () => {
                try {
                  const newToken = await getToken(messaging);
                  await updateFCMToken({ token: newToken, action: "add" });
                } catch (refreshError) {
                  console.error("Error refreshing FCM token:", refreshError);
                }
              });

              // Handle foreground messages
              onMessage(messaging, (payload) => {
                // Play notification sound
                const audio = new Audio("/notification-sound.mp3");
                audio
                  .play()
                  .catch((e) => console.log("Audio playback failed:", e));

                toast.custom(
                  (t) => (
                    <div
                      className={`${
                        t.visible ? "animate-enter" : "animate-leave"
                      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src="/icon-192x192.png"
                              alt=""
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {payload.notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {payload.notification.body}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex border-l border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            window.location.href =
                              payload.fcmOptions?.link || "/admin";
                            toast.dismiss(t.id);
                          }}
                          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ),
                  {
                    duration: 5000,
                  }
                );
              });
            }
          } catch (tokenError) {
            console.error("Error getting FCM token:", tokenError);
          }
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    setupPushNotifications();
  }, []);

  return null; // This component doesn't render anything
}
