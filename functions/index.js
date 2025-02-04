const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.app_password,
    },
});

exports.sendContactNotification = functions.firestore
    .document("messages/{messageId}")
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const messageId = context.params.messageId;

        try {
            const notifications = [];

            // 1. Send email notification
            const emailPromise = transporter.sendMail({
                from: functions.config().gmail.email,
                to: functions.config().admin.email,
                subject: `New Contact Form Message from ${message.name}`,
                html: `
            <h2 style="color: #4F46E5;">New Contact Form Submission</h2>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${message.name}</p>
                <p><strong>Email:</strong> ${message.email}</p>
                <p><strong>Message:</strong></p>
                <div style="padding: 15px; background-color: #F9FAFB; border-radius: 6px; margin: 10px 0;">
                ${message.message}
                </div>
                <p><strong>Submitted at:</strong> ${message.timestamp
                            .toDate()
                            .toLocaleString()}</p>
                <p><strong>Message ID:</strong> ${messageId}</p>
            </div>
            <p style="color: #6B7280; font-size: 0.875rem;">
                This is an automated notification from your portfolio website.
            </p>
        `,
            });
            notifications.push(emailPromise);

            // 2. Send push notification using FCM
            // Get the FCM tokens from your admin users collection
            const adminDoc = await admin
                .firestore()
                .collection("adminUsers")
                .doc(functions.config().admin.uid)
                .get();
            if (adminDoc.exists && adminDoc.data().fcmTokens) {
                const fcmTokens = adminDoc.data().fcmTokens;

                const pushNotificationPromise = admin.messaging().sendMulticast({
                    tokens: fcmTokens,
                    notification: {
                        title: `New Message from ${message.name}`,
                        body:
                            message.message.substring(0, 100) +
                            (message.message.length > 100 ? "..." : ""),
                        icon: "/icon-192x192.png", // Your PWA icon
                        click_action: `${functions.config().app.url
                            }/admin?messageId=${messageId}`, // Deep link to the message
                    },
                    data: {
                        messageId: messageId,
                        type: "contact_form",
                        timestamp: message.timestamp.toDate().toISOString(),
                    },
                    webpush: {
                        headers: {
                            Urgency: "high",
                        },
                        notification: {
                            requireInteraction: true,
                            badge: "/icon-72x72.png",
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
                        },
                        fcm_options: {
                            link: `${functions.config().app.url
                                }/admin?messageId=${messageId}`,
                        },
                    },
                });
                notifications.push(pushNotificationPromise);
            }

            // Wait for all notifications to complete
            const results = await Promise.allSettled(notifications);

            // Check results and update the message document
            const emailResult = results[0];
            const pushResult = results[1];

            await snap.ref.update({
                notificationSent: true,
                notificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
                emailNotificationSent: emailResult.status === "fulfilled",
                pushNotificationSent: pushResult
                    ? pushResult.status === "fulfilled"
                    : false,
                notificationResults: {
                    email:
                        emailResult.status === "fulfilled"
                            ? "success"
                            : emailResult.reason?.message,
                    push: pushResult
                        ? pushResult.status === "fulfilled"
                            ? "success"
                            : pushResult.reason?.message
                        : "no_tokens",
                },
            });
        } catch (error) {
            console.error("Error sending notifications:", error);
            await snap.ref.update({
                notificationSent: true,
                notificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
                emailNotificationSent: false,
                pushNotificationSent: false,
                error: error.message,
            });
        }
    });

// Handle FCM token updates
exports.updateFCMToken = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated"
        );
    }

    const { token, action } = data; // action can be 'add' or 'remove'

    try {
        const userRef = admin
            .firestore()
            .collection("adminUsers")
            .doc(context.auth.uid);

        if (action === "add") {
            // Add the new token to the user's FCM tokens
            await userRef.set(
                {
                    fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
                },
                { merge: true }
            );
        } else if (action === "remove") {
            // Remove the token from the user's FCM tokens
            await userRef.update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating FCM token:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Error updating FCM token"
        );
    }
});
