"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, collection, query, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { updateMessageStatus } from "@/lib/firebaseHelpers";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { motion, AnimatePresence } from "framer-motion";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <motion.div
                role="status"
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <div className="h-32 w-32 border-b-2 border-indigo-500 rounded-full" />
                <span className="sr-only">Loading...</span>
            </motion.div>
        </div>
    );
}

export default function AdminPanel() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const router = useRouter();

    const fetchMessages = useCallback(async () => {
        try {
            const db = getFirestore(app);
            const messagesRef = collection(db, "messages");
            const q = query(messagesRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const messagesList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString() || "No date",
            }));
            setMessages(messagesList);
            setUnreadCount(messagesList.filter((m) => m.status === "unread").length);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to fetch messages");
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                fetchMessages();
            }
        });

        // Check for existing lockout
        const storedLockout = localStorage.getItem("loginLockout");
        if (storedLockout) {
            const lockoutTime = parseInt(storedLockout);
            if (lockoutTime > Date.now()) {
                setLockoutUntil(lockoutTime);
            } else {
                localStorage.removeItem("loginLockout");
            }
        }

        return () => unsubscribe();
    }, [fetchMessages]);

    // Add real-time listener for messages
    useEffect(() => {
        if (user) {
            const db = getFirestore(app);
            const messagesRef = collection(db, "messages");
            const q = query(messagesRef, orderBy("timestamp", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate().toLocaleString() || "No date",
                }));
                setMessages(messagesList);
                setUnreadCount(messagesList.filter((m) => m.status === "unread").length);
            }, (error) => {
                console.error("Error listening to messages:", error);
                toast.error("Failed to listen to messages");
            });

            return () => unsubscribe();
        }
    }, [user]);

    const handleLogin = async () => {
        try {
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            // Add the admin email to the provider
            provider.setCustomParameters({
                login_hint: process.env.NEXT_PUBLIC_ADMIN_EMAIL
            });
            await signInWithPopup(auth, provider);
            toast.success("Login successful!");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please try again.");
        }
    };

    const handleResetPassword = async () => {
        try {
            setIsResettingPassword(true);
            await sendPasswordResetEmail(getAuth(app), process.env.NEXT_PUBLIC_ADMIN_EMAIL);
            toast.success("Password reset email sent!");
            setShowResetPassword(false);
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Failed to send reset email");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            const result = await updateMessageStatus(messageId, "read");
            if (result.success) {
                toast.success("Message marked as read");
                fetchMessages(); // Refresh messages
            } else {
                throw new Error(result.error || "Failed to update message status");
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
            toast.error("Failed to update message status");
        }
    };

    if (!mounted || loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            Admin Login
                        </h2>
                    </div>
                    <div className="mt-8 space-y-6">
                        <button
                            onClick={handleLogin}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white"
                        >
                            Contact Messages
                        </motion.h1>
                        <AnimatePresence mode="wait">
                            {unreadCount > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400"
                                >
                                    {unreadCount} unread{" "}
                                    {unreadCount === 1 ? "message" : "messages"}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => getAuth(app).signOut()}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                            Sign Out
                        </motion.button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
                >
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <AnimatePresence mode="wait">
                            {messages.length === 0 ? (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No messages yet
                                </motion.p>
                            ) : (
                                messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${message.status === "unread"
                                            ? "bg-indigo-50 dark:bg-indigo-900/20"
                                            : ""
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-grow">
                                                <div className="flex items-center flex-wrap gap-4">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {message.subject}
                                                    </h3>
                                                    {message.status === "unread" && (
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                                        >
                                                            Unread
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    From: {message.name} ({message.email})
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 self-end sm:self-auto">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {message.timestamp}
                                                </span>
                                                {message.status === "unread" && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleMarkAsRead(message.id)}
                                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                                                    >
                                                        Mark as Read
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-4"
                                        >
                                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                                {message.message}
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
