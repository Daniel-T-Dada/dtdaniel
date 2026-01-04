"use client";

import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import { deleteDocument, Project } from "@/lib/firebaseHelpers";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { notify } from "@/utils/toast";
import Link from "next/link";

interface ProjectListProps {
    onEdit: (project: Project & { id: string }) => void;
}

interface ProjectWithId extends Project {
    id: string;
}

export default function ProjectList({ onEdit }: ProjectListProps) {
    const [projects, setProjects] = useState<ProjectWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);

    useEffect(() => {
        // Set up real-time listener
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ProjectWithId[];
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            notify.error("Failed to load projects");
            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const handleDelete = async (projectId: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        const loadingToast = notify.loading("Deleting project...");
        try {
            await deleteDocument("projects", projectId);
            notify.dismiss(loadingToast);
            notify.success("Project deleted successfully");
            // fetchProjects is not needed as onSnapshot handles updates
        } catch (error) {
            console.error("Error deleting project:", error);
            notify.dismiss(loadingToast);
            notify.error("Failed to delete project");
        }
    };

    const handleReorder = async (newOrder: ProjectWithId[]) => {
        setProjects(newOrder);

        notify.promise(
            // Your reorder implementation here
            new Promise((resolve) => {
                // Temporary promise until implementation is added
                // In a real implementation, you would batch update the order fields in Firestore
                setTimeout(resolve, 500);
            }),
            {
                loading: 'Updating project order...',
                success: 'Project order updated successfully',
                error: 'Failed to update project order'
            }
        );
    };

    // Function to get image URL with fallback
    const getImageUrl = (project: ProjectWithId) => {
        if (!project.imageUrl) {
            // Create a data URL for the placeholder
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <rect width="800" height="600" fill="#4F46E5"/>
                    <text 
                        x="400" 
                        y="300" 
                        font-family="Arial" 
                        font-size="24" 
                        fill="white" 
                        text-anchor="middle" 
                        dominant-baseline="middle"
                    >
                        ${project.title || 'Project'}
                    </text>
                </svg>
            `)}`;
        }
        return project.imageUrl;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No projects found. Add your first project above.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {projects.length} Project{projects.length !== 1 && "s"}
                </h3>
                <button
                    onClick={() => setReordering(!reordering)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                    {reordering ? "Save Order" : "Reorder Projects"}
                </button>
            </div>

            <Reorder.Group
                axis="y"
                values={projects}
                onReorder={handleReorder}
                className="space-y-4"
            >
                {projects.map((project) => (
                    <Reorder.Item
                        key={project.id}
                        value={project}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${reordering ? "cursor-move" : ""}`}
                    >
                        <div className="flex flex-col sm:flex-row items-start p-4 gap-4">
                            <div className="relative w-full sm:w-32 aspect-video sm:h-20 flex-shrink-0">
                                <Image
                                    src={getImageUrl(project)}
                                    alt={project.title || "Project"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 128px"
                                    className="object-cover rounded-md"
                                    priority={true}
                                />
                            </div>
                            <div className="flex-grow w-full">
                                <Link href={`/projects/${project.id}`} className="block">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                                        {project.title}
                                    </h4>
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {project.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {project.technologies?.slice(0, 3).map((tech) => (
                                        <span
                                            key={tech}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {(project.technologies?.length || 0) > 3 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {(project.technologies?.length || 0) - 3} more
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex flex-wrap gap-4">
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Live Demo →
                                            </a>
                                        )}
                                        {project.githubUrl && !project.isPrivate && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                                </svg>
                                                View on GitHub
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(project)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            aria-label="Edit project"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            aria-label="Delete project"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    );
}
