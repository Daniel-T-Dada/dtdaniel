"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ADMIN_EMAIL } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import MediaLibrary from "@/components/MediaLibrary";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { MediaItemType } from "@/components/MediaItem";

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

export default function MediaManagement() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            // Redirect if not admin
            if (!user || user.email !== ADMIN_EMAIL) {
                toast.error("Unauthorized access");
                router.push("/admin");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMediaSelect = (media: MediaItemType | MediaItemType[]) => {
        // Handle media selection if needed
        console.log('Selected media:', media);
    };

    if (!mounted || loading) {
        return <LoadingSpinner />;
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return null; // Router will handle redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center text-sm font-medium">
                    <Link
                        href="/admin"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Dashboard
                    </Link>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-2" />
                    <span className="text-gray-900 dark:text-gray-100">Media Library</span>
                </nav>

                <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Media Management
                </h1>
            </div>

            {/* Media Library Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <MediaLibrary onSelect={handleMediaSelect} multiple={true} />
            </div>
        </div>
    );
}
