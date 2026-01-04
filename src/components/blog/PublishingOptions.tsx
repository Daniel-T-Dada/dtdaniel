"use client";

import React from 'react';

interface PublishingOptionsProps {
    scheduledFor: string;
    setScheduledFor: (value: string) => void;
    published: boolean;
    setPublished: (value: boolean) => void;
}

export default function PublishingOptions({
    scheduledFor,
    setScheduledFor,
    published,
    setPublished
}: PublishingOptionsProps) {
    return (
        <div className="space-y-6">
            {/* Scheduling Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Schedule Publication
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 lg:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                        value={scheduledFor}
                        onChange={(e) => {
                            setScheduledFor(e.target.value);
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {scheduledFor
                            ? `This post will be published on ${new Date(scheduledFor).toLocaleString()}`
                            : 'Leave empty to publish immediately or save as draft'
                        }
                    </p>
                </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="published"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        checked={published}
                        onChange={(e) => {
                            setPublished(e.target.checked);
                        }}
                        disabled={!!scheduledFor}
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                        Publish now
                    </label>
                </div>
                <p className="mt-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {scheduledFor
                        ? 'Scheduled posts cannot be published immediately'
                        : published
                            ? 'This post will be visible to the public'
                            : 'This post will be saved as a draft'
                    }
                </p>
            </div>
        </div>
    );
}
