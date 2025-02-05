firebase.initializeApp({
            apiKey: "undefined",
            authDomain: "undefined",
            projectId: "undefined",
            storageBucket: "undefined",
            messagingSenderId: "undefined",
            appId: "undefined"
        });

        // Initialize Firebase Cloud Messaging and get a reference to the service
        const messaging = firebase.messaging();