/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
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
