"use client";

import { useState } from "react";
// @ts-ignore - lib/firebase usually needs explicit export or typing
import { testFirestoreConnection } from "@/lib/firebase";
import {
    addProject,
    addSkill,
    getProjects,
    getSkills,
} from "@/lib/firebaseHelpers";
import { Project, Skill } from "@/lib/firebaseHelpers";

// Updated skills based on your projects
const skillsData = [
    {
        name: "Frontend Development",
        category: "Development",
        proficiency: 90,
        skills: ["React", "Next.js", "Tailwind CSS", "Material UI", "Bootstrap"],
    },
    {
        name: "Backend Development",
        category: "Development",
        proficiency: 85,
        skills: ["Django", "Node.js", "Express", "PostgreSQL", "MongoDB"],
    },
    {
        name: "Cloud & DevOps",
        category: "Infrastructure",
        proficiency: 80,
        skills: ["Firebase", "Vercel", "Git", "Docker", "CI/CD"],
    },
];

// Placeholder for projectsData if it was intended to be imported or defined
const projectsData: any[] = [];

export default function FirebaseTest() {
    const [status, setStatus] = useState("");
    const [data, setData] = useState<{ projects: Project[]; skills: Skill[] } | null>(null);

    const testConnection = async () => {
        setStatus("Testing connection...");
        try {
            const result = await testFirestoreConnection();
            setStatus(result ? "Connection successful!" : "Connection failed!");
        } catch (error: any) {
            setStatus("Error: " + error.message);
        }
    };

    const addAllProjects = async () => {
        setStatus("Adding projects...");
        try {
            if (projectsData.length === 0) {
                setStatus("No projects data found to add.");
                return;
            }
            const results = await Promise.all(
                projectsData.map((project) => addProject(project))
            );
            setStatus(`Successfully added ${results.length} projects!`);
        } catch (error: any) {
            setStatus("Error adding projects: " + error.message);
        }
    };

    const addAllSkills = async () => {
        setStatus("Adding skills...");
        try {
            const results = await Promise.all(
                skillsData.map((skill) => addSkill(skill as any))
            );
            setStatus(`Successfully added ${results.length} skill categories!`);
        } catch (error: any) {
            setStatus("Error adding skills: " + error.message);
        }
    };

    const fetchData = async () => {
        setStatus("Fetching data...");
        try {
            const projects = await getProjects();
            const skills = await getSkills();
            setData({ projects, skills });
            setStatus("Data fetched successfully!");
        } catch (error: any) {
            setStatus("Error fetching data: " + error.message);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Firebase Data Management</h2>

            <div className="space-y-4">
                <button
                    onClick={testConnection}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                >
                    Test Connection
                </button>

                <button
                    onClick={addAllProjects}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                    Add All Projects
                </button>

                <button
                    onClick={addAllSkills}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
                >
                    Add All Skills
                </button>

                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                    Fetch Data
                </button>

                <div className="mt-4">
                    <p className="font-semibold">Status:</p>
                    <p className="text-gray-600 dark:text-gray-300">{status}</p>
                </div>

                {data && (
                    <div className="mt-4">
                        <p className="font-semibold">Fetched Data:</p>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded mt-2 overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
