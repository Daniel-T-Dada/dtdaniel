const fs = require("fs");
const path = require("path");

// Function to generate the Firebase configuration file
function generateFirebaseConfig() {
    const config = `
        firebase.initializeApp({
            apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
            authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
            projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
            storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
            messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
            appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
        });
    `;

    // Create the firebase-config.js file in the public directory
    const publicDir = path.join(process.cwd(), "public");
    fs.writeFileSync(path.join(publicDir, "firebase-config.js"), config.trim());
}

// Execute the function
generateFirebaseConfig();
