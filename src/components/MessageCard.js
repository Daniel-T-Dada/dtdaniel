"use client";

import { useState } from "react";
import { format } from "date-fns";
import MessageReplyForm from "./MessageReplyForm";
import { CheckIcon, ReplyIcon } from "@heroicons/react/24/outline";

export default function MessageCard({ message, onMarkAsRead }) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return format(date, "MMM d, yyyy 'at' h:mm a");
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
                    {message.message}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(message.timestamp)}
                    </div>
                    <div className="flex flex-row gap-2">
                        {message.status === "unread" && (
                            <button
                                onClick={() => onMarkAsRead(message.id)}
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

            {showReplyForm && (
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
