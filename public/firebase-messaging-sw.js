// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Load configuration from the generated file
importScripts('/firebase-config.js');

// Initialize Firebase with authentication
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages with authentication
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        data: {
            ...payload.data,
            click_action: payload.notification.click_action
        },
        actions: [
            {
                action: 'view',
                title: 'View Message'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks with proper routing
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view' && event.notification.data) {
        const messageId = event.notification.data.messageId;
        const urlToOpen = new URL(`/admin?messageId=${messageId}`, self.location.origin);

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there is already a window/tab open with the target URL
                    for (const client of clientList) {
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
