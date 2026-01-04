"use client";

import { useState } from "react";
import { format } from "date-fns";
import MessageReplyForm from "./MessageReplyForm";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import ReplyIcon from "@heroicons/react/24/outline/ArrowUturnLeftIcon";
import { Message } from "@/lib/firebaseHelpers";
import { Timestamp } from "firebase/firestore";

// Extend Message interface to allow timestamp to be string (as handled in AdminPanel currently)
interface AdminMessage extends Omit<Message, 'timestamp'> {
    timestamp: Timestamp | string;
}

interface MessageCardProps {
    message: AdminMessage;
    // eslint-disable-next-line no-unused-vars
    onMarkAsRead: (id: string) => void;
}

export default function MessageCard({ message, onMarkAsRead }: MessageCardProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const formatDate = (timestamp: Timestamp | string) => {
        if (!timestamp) return "";
        if (typeof timestamp === 'string') return timestamp;
        if (timestamp && typeof (timestamp as Timestamp).toDate === 'function') {
            const date = (timestamp as Timestamp).toDate();
            return format(date, "MMM d, yyyy 'at' h:mm a");
        }
        return "";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {message.subject}
                    </h3>
                    <span className={`text-sm ${message.status === "unread"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400"
                        }`}>
                        {message.status === "unread" ? "Unread" : "Read"}
                    </span>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        From: {message.name} ({message.email})
                    </p>
                </div>

                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {message.content}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(message.timestamp)}
                    </div>
                    <div className="flex flex-row gap-2">
                        {message.status === "unread" && (
                            <button
                                onClick={() => message.id && onMarkAsRead(message.id)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                            >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Mark as Read
                            </button>
                        )}
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                        >
                            <ReplyIcon className="h-4 w-4 mr-1" />
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {showReplyForm && message.id && (
                <MessageReplyForm
                    messageId={message.id}
                    recipientEmail={message.email}
                    recipientName={message.name}
                    onClose={() => setShowReplyForm(false)}
                />
            )}
        </div>
    );
}
