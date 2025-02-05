const fs = require("fs");
const path = require("path");

// Function to generate the Firebase configuration file
function generateFirebaseConfig() {
    // Create a configuration for the service worker with messaging support
    const config = `
        // Firebase configuration object
        const firebaseConfig = {
            apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
            authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
            projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
            storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
            messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
            appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
    `.trim();

    // Write the configuration to a file
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(publicDir, "firebase-config.js"),
        config
    );

    console.log("Firebase config generated successfully");
}

// Run the generation
generateFirebaseConfig();
