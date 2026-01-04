"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    User
} from "firebase/auth";
import { getFirestore, collection, query, orderBy, getDocs, onSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { app } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { updateMessageStatus, Message } from "@/lib/firebaseHelpers";
import { motion, AnimatePresence } from "framer-motion";
import MessageReplyForm from "@/components/MessageReplyForm";
import Link from "next/link";
import { ADMIN_EMAIL } from "@/lib/firebase";
import { notify } from "@/utils/toast";
import MessageCard from "@/components/MessageCard";

// Message interface extending the base one to handle string timestamps if needed
interface AdminMessage extends Omit<Message, 'timestamp'> {
    id: string;
    timestamp: Timestamp | string;
    replies?: any[];
}

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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
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
            })) as AdminMessage[];
            setMessages(messagesList);
            setUnreadCount(messagesList.filter((m) => m.status === "unread").length);
        } catch (error) {
            console.error("Error fetching messages:", error);
            notify.error("Failed to fetch messages");
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        const auth = getAuth(app);

        const storedLockout = localStorage.getItem("loginLockout");
        if (storedLockout) {
            const lockoutTime = parseInt(storedLockout);
            if (lockoutTime > Date.now()) {
                setLockoutUntil(lockoutTime);
            } else {
                localStorage.removeItem("loginLockout");
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                fetchMessages();
            }
        });

        return () => unsubscribe();
    }, [fetchMessages]);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toLocaleString() || "No date",
            })) as AdminMessage[];
            setMessages(messagesList);
            setUnreadCount(messagesList.filter((m) => m.status === "unread").length);
        }, (error) => {
            console.error("Error listening to messages:", error);
            notify.error("Failed to listen to messages");
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogin = async () => {
        try {
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                login_hint: ADMIN_EMAIL
            });
            const result = await signInWithPopup(auth, provider);
            if (result.user.email === ADMIN_EMAIL) {
                notify.success("Logged in successfully");
            } else {
                await auth.signOut();
                notify.error("Unauthorized access");
            }
        } catch (error) {
            console.error("Login error:", error);
            notify.error("Login failed");
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleResetPassword = async () => {
        try {
            setIsResettingPassword(true);
            const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (email) {
                await sendPasswordResetEmail(getAuth(app), email);
                notify.success("Password reset email sent!");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            notify.error("Failed to send reset email");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const result = await updateMessageStatus(messageId, "read");
            if (result.success) {
                notify.success("Message marked as read");
                fetchMessages();
            } else {
                throw new Error(result.error || "Failed to update message status");
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
            notify.error("Failed to update message status");
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Admin Navigation - Mobile Optimized */}
                <div className="mb-4 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-4">
                    <Link
                        href="/"
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>
                    <Link
                        href="/admin/projects"
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Projects
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact
                    </Link>
                </div>

                {/* Admin Panel Content - Mobile Optimized */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                            >
                                Contact Messages
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-indigo-600 dark:text-indigo-400"
                            >
                                {unreadCount > 0 && `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`}
                            </motion.p>
                        </div>
                        <Link
                            href="/admin/projects"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto whitespace-nowrap"
                        >
                            Manage Projects
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {messages.length === 0 ? (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No messages yet
                                </motion.p>
                            ) : (
                                messages.map((message) => (
                                    <MessageCard
                                        key={message.id}
                                        message={message}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedMessage && (
                    <MessageReplyForm
                        messageId={selectedMessage.id}
                        recipientEmail={selectedMessage.email}
                        recipientName={selectedMessage.name}
                        onClose={() => setSelectedMessage(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

