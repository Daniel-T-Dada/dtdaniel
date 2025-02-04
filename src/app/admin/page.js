"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        fetchMessages();
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
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
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutUntil && lockoutUntil > Date.now()) {
      const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
      toast.error(
        `Too many attempts. Try again in ${remainingMinutes} minutes`
      );
      return;
    }

    try {
      const { email, password } = loginData;
      if (email !== ADMIN_EMAIL) {
        toast.error("Invalid email address");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");
        setLoginAttempts(0);
        localStorage.removeItem("loginLockout");
      } catch (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION;
          setLockoutUntil(lockoutTime);
          localStorage.setItem("loginLockout", lockoutTime.toString());
          toast.error(`Account locked. Try again in 15 minutes`);
          return;
        }

        switch (error.code) {
          case "auth/invalid-credential":
            toast.error(
              `Invalid email or password. ${
                MAX_LOGIN_ATTEMPTS - newAttempts
              } attempts remaining`
            );
            break;
          case "auth/user-not-found":
            toast.error("User not found. Please check your email");
            break;
          case "auth/wrong-password":
            toast.error(
              `Incorrect password. ${
                MAX_LOGIN_ATTEMPTS - newAttempts
              } attempts remaining`
            );
            break;
          case "auth/too-many-requests":
            toast.error("Too many failed attempts. Please try again later");
            break;
          default:
            toast.error("Login failed. Please try again");
        }
        console.error("Login error:", error);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsResettingPassword(true);
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      toast.success("Password reset email sent!");
      setShowResetPassword(false);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset email");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
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

  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                  placeholder="Email address"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={showPassword ? "show" : "hide"}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      )}
                    </motion.svg>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            <PasswordStrengthIndicator password={loginData.password} />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={lockoutUntil > Date.now()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Password Reset Modal */}
        <AnimatePresence>
          {showResetPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Reset Password
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Are you sure you want to reset your password? An email will be
                  sent to {ADMIN_EMAIL} with instructions.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowResetPassword(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                    disabled={isResettingPassword}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isResettingPassword ? "Sending..." : "Send Reset Email"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
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
              onClick={() => auth.signOut()}
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
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      message.status === "unread"
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
