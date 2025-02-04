importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Load configuration from a separate file that will be generated at build time
importScripts("/firebase-config.js");

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/icon-192x192.png",
        badge: "/icon-72x72.png",
        data: payload.data,
        actions: [
            {
                action: "view",
                title: "View Message",
            },
            {
                action: "dismiss",
                title: "Dismiss",
            },
        ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "view") {
        const messageId = event.notification.data.messageId;
        const urlToOpen = new URL(
            `/admin?messageId=${messageId}`,
            self.location.origin
        );

        event.waitUntil(
            clients.matchAll({ type: "window" }).then((windowClients) => {
                // Check if there is already a window/tab open with the target URL
                for (let client of windowClients) {
                    if (client.url === urlToOpen.href && "focus" in client) {
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
