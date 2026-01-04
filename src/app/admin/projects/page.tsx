"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ADMIN_EMAIL } from "@/lib/firebase";
import ProjectForm from "@/components/ProjectForm";
// @ts-ignore
import ProjectList from "@/components/ProjectList";
import { addProject, updateProject, Project } from "@/lib/firebaseHelpers";
import Link from "next/link";
import { notify } from "@/utils/toast";

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

// Interface matching Project + optional id for editing context
interface EditableProject extends Project {
    id: string;
}

export default function ProjectsAdmin() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            // Redirect if not admin
            if (!user || user.email !== ADMIN_EMAIL) {
                notify.error("Unauthorized access");
                router.push("/admin");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleProjectSubmit = async (projectData: any) => {
        try {
            if (editingProject) {
                // Update existing project
                await updateProject(editingProject.id, projectData);
                notify.success("Project updated successfully");
                setEditingProject(null);
            } else {
                // Add new project
                await addProject(projectData);
                notify.success("Project added successfully");
            }
        } catch (error: any) {
            console.error("Error saving project:", error);
            notify.error(error.message || "Failed to save project");
        }
    };

    const handleEdit = (project: EditableProject) => {
        setEditingProject(project);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!mounted || loading) {
        return <LoadingSpinner />;
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return null; // Router will handle redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Admin Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="mb-8 flex items-center gap-4">
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
                        href="/admin"
                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Admin
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Project Management
                            </h1>
                        </div>

                        {/* Project Form */}
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                {editingProject ? "Edit Project" : "Add New Project"}
                            </h2>
                            <ProjectForm
                                onSubmit={handleProjectSubmit}
                                initialData={editingProject}
                            />
                            {editingProject && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setEditingProject(null)}
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        Cancel Editing
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Project List */}
                        <div>
                            <ProjectList onEdit={handleEdit} />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
