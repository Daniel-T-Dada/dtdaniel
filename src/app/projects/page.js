"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProjects } from "@/lib/firebaseHelpers";
import Navbar from "@/components/Navbar";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [technologies, setTechnologies] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsData = await getProjects();
                setProjects(projectsData);

                // Extract unique technologies
                const techSet = new Set();
                projectsData.forEach((project) => {
                    project.technologies?.forEach((tech) => techSet.add(tech));
                });
                setTechnologies(Array.from(techSet));
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = projects.filter((project) => {
        if (filter === "all") return true;
        return project.technologies?.includes(filter);
    });

    const getImageUrl = (project) => {
        if (!project.imageUrl) {
            // Create SVG placeholder
            const svg = `
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
            `;
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
        }
        return project.imageUrl;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        My Projects
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Explore my latest work and side projects
                    </p>
                </motion.div>

                {/* Filter Section */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-full transition-colors ${filter === "all"
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            All Projects
                        </button>
                        {technologies.map((tech) => (
                            <button
                                key={tech}
                                onClick={() => setFilter(tech)}
                                className={`px-4 py-2 rounded-full transition-colors ${filter === tech
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Link href={`/projects/${project.id}`} className="block">
                                        <Image
                                            src={getImageUrl(project)}
                                            alt={project.title}
                                            fill
                                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity" />
                                    </Link>
                                </div>
                                <div className="p-6">
                                    <Link href={`/projects/${project.id}`} className="block">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                                            {project.title}
                                        </h2>
                                    </Link>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.technologies?.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Live Demo →
                                            </a>
                                        )}
                                        <div className="text-right">
                                            {project.githubUrl === "private" ? (
                                                <span className="flex items-center text-gray-500 dark:text-gray-400 cursor-not-allowed">
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
                                                        />
                                                    </svg>
                                                    Private
                                                </span>
                                            ) : project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    GitHub →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
