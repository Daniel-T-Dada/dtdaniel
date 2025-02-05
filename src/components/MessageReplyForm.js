"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMessageReply } from "@/lib/firebaseHelpers";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { notify } from "@/utils/toast";

export default function MessageReplyForm({ messageId, recipientEmail, recipientName, onClose }) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            notify.error("Please enter a reply message");
            return;
        }

        setIsSubmitting(true);
        try {
            const auth = getAuth();
            const adminEmail = auth.currentUser?.email;

            if (!adminEmail) {
                throw new Error("Admin email not found. Please sign in again.");
            }

            const result = await addMessageReply(messageId, {
                content: content.trim(),
                adminEmail: adminEmail,
            });

            if (result.success) {
                notify.success("Reply sent successfully");
                onClose();
            } else {
                throw new Error(result.error || "Failed to send reply");
            }
        } catch (error) {
            console.error("Error sending reply:", error);
            notify.error(error.message || "Failed to send reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Reply to {recipientName}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="reply" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Reply
                            </label>
                            <textarea
                                id="reply"
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type your reply here..."
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Reply"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
} 