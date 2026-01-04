"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { notify } from "@/utils/toast";
import ImageUpload from "./ImageUpload";
import { Project } from "@/lib/firebaseHelpers";

interface ProjectFormData {
    title: string;
    description: string;
    technologies: string[];
    githubUrl: string;
    liveUrl: string;
    isPrivate: boolean;
    order: number;
    imageUrl: string;
}

interface ProjectFormProps {
    onSubmit: (data: ProjectFormData) => Promise<void>;
    initialData?: Project | null;
}

export default function ProjectForm({ onSubmit, initialData = null }: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        title: "",
        description: "",
        technologies: [],
        githubUrl: "",
        liveUrl: "",
        isPrivate: false,
        order: 0,
        imageUrl: "",
    });
    const [newTech, setNewTech] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                technologies: initialData.technologies || [],
                githubUrl: initialData.githubUrl || "",
                liveUrl: initialData.liveUrl || "",
                isPrivate: initialData.isPrivate || false,
                order: initialData.order || 0,
                imageUrl: initialData.imageUrl || "",
            });
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleAddTechnology = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!newTech.trim()) return;

        // Split by comma, trim whitespace, and filter out empty strings
        const techArray = newTech
            .split(',')
            .map(tech => tech.trim())
            .filter(tech => tech !== '');

        // Add all valid technologies that aren't already in the list
        const newTechs = techArray.filter(tech => !formData.technologies.includes(tech));
        if (newTechs.length > 0) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, ...newTechs]
            }));
            setNewTech(''); // Clear input after adding
        }
    };

    const handleRemoveTechnology = (techToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(tech => tech !== techToRemove)
        }));
    };

    const handleImageUploaded = (url: string | null) => {
        if (url) {
            setFormData(prev => ({
                ...prev,
                imageUrl: url
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Basic validation
        const { title, description, technologies, imageUrl } = formData;
        if (!title || !description) {
            notify.error("Title and description are required");
            return;
        }

        if (technologies.length === 0) {
            notify.error("Add at least one technology");
            return;
        }

        if (!imageUrl && !initialData?.imageUrl) {
            notify.error("Please upload a project image");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            notify.success(initialData ? "Project updated successfully" : "Project added successfully");
            if (!initialData) {
                // Reset form if it's a new project
                setFormData({
                    title: "",
                    description: "",
                    technologies: [],
                    githubUrl: "",
                    liveUrl: "",
                    isPrivate: false,
                    order: 0,
                    imageUrl: "",
                });
            }
        } catch (error: any) {
            console.error("Error submitting project:", error);
            notify.error(error.message || "Failed to submit project");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Image *
                </label>
                <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImageUrl={formData.imageUrl}
                />
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Technologies *
                </label>
                <div className="mt-1 flex gap-2">
                    <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        className="block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                        placeholder="E.g. React, Next.js, Tailwind CSS"
                    />
                    <button
                        onClick={handleAddTechnology}
                        type="button"
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                        Add
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {formData.technologies.map((tech) => (
                        <span
                            key={tech}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        >
                            {tech}
                            <button
                                type="button"
                                onClick={() => handleRemoveTechnology(tech)}
                                className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 focus:outline-none"
                            >
                                <span className="sr-only">Remove {tech}</span>
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GitHub URL
                </label>
                <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Live URL
                </label>
                <input
                    type="url"
                    id="liveUrl"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:outline-none border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Private Repository
                </label>
            </div>

            <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Order
                </label>
                <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none dark:text-white sm:text-sm"
                    min="0"
                />
            </div>

            <div className="flex justify-end">
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : initialData ? "Update Project" : "Add Project"}
                </motion.button>
            </div>
        </form>
    );
}
