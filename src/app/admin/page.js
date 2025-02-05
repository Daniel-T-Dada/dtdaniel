"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
import MessageReplyForm from "@/components/MessageReplyForm";
import Link from "next/link";
import { ADMIN_EMAIL } from "@/lib/firebase";
import ThemeToggle from "@/components/ThemeToggle";
import { notify } from "@/utils/toast";

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
    const [selectedMessage, setSelectedMessage] = useState(null);
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
            }));
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

    const handleResetPassword = async () => {
        try {
            setIsResettingPassword(true);
            await sendPasswordResetEmail(getAuth(app), process.env.NEXT_PUBLIC_ADMIN_EMAIL);
            notify.success("Password reset email sent!");
            setShowResetPassword(false);
        } catch (error) {
            console.error("Reset password error:", error);
            notify.error("Failed to send reset email");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Admin Navigation */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </Link>
                        <Link
                            href="/projects"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Projects
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => getAuth(app).signOut()}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Admin Panel Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
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
                                className="mt-2 text-sm text-indigo-600 dark:text-indigo-400"
                            >
                                {unreadCount > 0 && `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`}
                            </motion.p>
                        </div>
                        <Link
                            href="/admin/projects"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No messages yet
                                </motion.p>
                            ) : (
                                messages.map((message, index) => (
                                    <MessageCard
                                        key={message.id}
                                        message={message}
                                        index={index}
                                        onMarkAsRead={handleMarkAsRead}
                                        onReply={() => setSelectedMessage(message)}
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

const MessageCard = memo(({ message, index, onMarkAsRead, onReply }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${message.status === "unread" ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                }`}
        >
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-grow">
                        <div className="flex items-center flex-wrap gap-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {message.subject}
                            </h3>
                            {message.status === "unread" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    Unread
                                </span>
                            )}
                            {message.status === "replied" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Replied
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            From: {message.name} ({message.email})
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {message.timestamp}
                        </span>
                        <div className="flex flex-row items-center gap-2">
                            {message.status === "unread" && (
                                <button
                                    onClick={() => onMarkAsRead(message.id)}
                                    className="text-sm whitespace-nowrap text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                >
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => onReply()}
                                className="text-sm whitespace-nowrap text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {message.message}
                    </p>

                    {message.replies && message.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Replies
                            </h4>
                            {message.replies.map((reply, replyIndex) => (
                                <div
                                    key={replyIndex}
                                    className="pl-4 border-l-2 border-indigo-500"
                                >
                                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {reply.content}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        Sent by {reply.adminEmail} on{" "}
                                        {new Date(reply.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

MessageCard.displayName = 'MessageCard';
