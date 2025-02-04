// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
    apiKey: "AIzaSyBbkxr8hiLYoy6kcxayy13qj1gbyf4JeJ8",
    authDomain: "dtdaniel-20897.firebaseapp.com",
    projectId: "dtdaniel-20897",
    storageBucket: "dtdaniel-20897.firebasestorage.app",
    messagingSenderId: "60037856761",
    appId: "1:60037856761:web:916ab16ae92c553abf9128"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        data: payload.data,
        actions: [
            {
                action: 'view',
                title: 'View Message'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        const messageId = event.notification.data.messageId;
        const urlToOpen = new URL(`/admin?messageId=${messageId}`, self.location.origin);

        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((windowClients) => {
                // Check if there is already a window/tab open with the target URL
                for (let client of windowClients) {
                    if (client.url === urlToOpen.href && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window/tab is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen.href);
                }
            })
        );
    }
});
