"use client";

import { useState } from "react";
import { testFirestoreConnection } from "@/lib/firebase";
import {
  addProject,
  addSkill,
  getProjects,
  getSkills,
} from "@/lib/firebaseHelpers";

// Sample data for testing
const sampleProject = {
  title: "Portfolio Website",
  description: "A personal portfolio website built with Next.js and Firebase",
  technologies: ["Next.js", "Firebase", "Tailwind CSS"],
  imageUrl: "",
  githubUrl: "https://github.com/yourusername/portfolio",
  liveUrl: "https://your-portfolio.com",
  order: 1,
};

const sampleSkill = {
  name: "React",
  category: "Frontend",
  proficiency: 90,
  icon: "react",
};

export default function FirebaseTest() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);

  const testConnection = async () => {
    setStatus("Testing connection...");
    try {
      const result = await testFirestoreConnection();
      setStatus(result ? "Connection successful!" : "Connection failed!");
    } catch (error) {
      setStatus("Error: " + error.message);
    }
  };

  const addSampleData = async () => {
    setStatus("Adding sample data...");
    try {
      const projectId = await addProject(sampleProject);
      const skillId = await addSkill(sampleSkill);
      setStatus(
        `Sample data added! Project ID: ${projectId}, Skill ID: ${skillId}`
      );
    } catch (error) {
      setStatus("Error adding sample data: " + error.message);
    }
  };

  const fetchData = async () => {
    setStatus("Fetching data...");
    try {
      const projects = await getProjects();
      const skills = await getSkills();
      setData({ projects, skills });
      setStatus("Data fetched successfully!");
    } catch (error) {
      setStatus("Error fetching data: " + error.message);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>

      <div className="space-y-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Test Connection
        </button>

        <button
          onClick={addSampleData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
        >
          Add Sample Data
        </button>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
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
