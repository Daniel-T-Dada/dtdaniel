const fs = require("fs");
const path = require("path");

// Function to generate the Firebase configuration file
function generateFirebaseConfig() {
    // Create a minimal configuration for the service worker
    const config = `
        firebase.initializeApp({
            apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
            projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
            messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
            appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
        });
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

    console.log("Firebase initialized successfully");
}

// Run the generation
generateFirebaseConfig();
