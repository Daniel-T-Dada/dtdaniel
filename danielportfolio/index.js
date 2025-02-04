/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Create and deploy your first functions
//https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

// Simple HTTP function that returns a greeting
exports.greet = onRequest((request, response) => {
    logger.info("Greeting function called!", { structuredData: true });

    const name = request.query.name || "Guest";
    response.send({
        message: `Hello ${name}! This is your Firebase Function working.`,
        timestamp: new Date().toISOString()
    });
});

// Contact form submission function
exports.submitContactForm = onRequest(async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }

    try {
        // Ensure it's a POST request
        if (request.method !== "POST") {
            throw new Error("Method not allowed");
        }

        const { name, email, message } = request.body;

        // Validate the input
        if (!name || !email || !message) {
            throw new Error("Missing required fields");
        }

        // Store in Firestore
        const db = admin.firestore();
        await db.collection("contact_messages").add({
            name,
            email,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info("Contact form submission received", {
            name,
            email,
            timestamp: new Date().toISOString()
        });

        response.json({
            success: true,
            message: "Message received successfully!"
        });

    } catch (error) {
        logger.error("Error in contact form submission:", error);
        response.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Function to update FCM token
exports.updateFCMToken = onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new Error("Unauthorized");
    }

    const { token, action, accessToken } = data;
    const userId = context.auth.uid;

    try {
        // Verify the OAuth token
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
        if (!response.ok) {
            throw new Error("Invalid OAuth token");
        }

        const userRef = admin.firestore().collection("adminUsers").doc(userId);

        if (action === "add") {
            // Add the token to the user's tokens array
            await userRef.set({
                fcmTokens: admin.firestore.FieldValue.arrayUnion(token)
            }, { merge: true });

            logger.info(`FCM token added for user ${userId}`);
            return { success: true, message: "Token added successfully" };
        } else if (action === "remove") {
            // Remove the token from the user's tokens array
            await userRef.update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(token)
            });

            logger.info(`FCM token removed for user ${userId}`);
            return { success: true, message: "Token removed successfully" };
        }

        throw new Error("Invalid action");
    } catch (error) {
        logger.error("Error updating FCM token:", error);
        throw new Error("Failed to update FCM token");
    }
});
