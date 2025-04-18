"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Blob from "@/components/Blob";
import { motion } from "framer-motion";
import { getAboutInfo, getProjects } from "@/lib/firebaseHelpers";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  const [aboutData, setAboutData] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Fetch data
    const fetchData = async () => {
      try {
        const [aboutInfo, projectsData] = await Promise.all([
          getAboutInfo(),
          getProjects(),
        ]);
        setAboutData(aboutInfo);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 relative">
        {/* Blob Effects */}
        <Blob className="-top-40 -left-40 rotate-45" />
        <Blob className="-bottom-40 -right-40 rotate-12" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left relative z-10"
            >
              <motion.h1
                className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Hi, I&apos;m{" "}
                <span className="text-indigo-600 dark:text-indigo-400 relative">
                  Double D
                  <motion.span
                    className="absolute -z-10 inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  />
                </span>
              </motion.h1>
              <motion.p
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                A passionate developer crafting beautiful digital experiences
              </motion.p>
              <motion.div
                className="flex justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link
                  href="/projects"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 transform duration-200"
                >
                  View My Work
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all hover:scale-105 transform duration-200"
                >
                  Contact Me
                </Link>
              </motion.div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full max-w-md mx-auto h-[600px]"
            >
              <div className="w-full h-full relative rounded-2xl overflow-hidden">
                {/* Background gradient for image */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/10 z-0" />

                {/* Image container with hover effect */}
                <div
                  className="relative z-10 w-full h-full transform transition-transform duration-500 hover:scale-105"
                  onMouseEnter={() => setImageHovered(true)}
                  onMouseLeave={() => setImageHovered(false)}
                >
                  <motion.div
                    animate={{ opacity: imageHovered ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src="/DSC07928.JPG"
                      alt="Double D Portrait"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: imageHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src="/DSC07929.JPG"
                      alt="Double D Standing"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-600/10 rounded-full blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* About Content */}
            <div className="space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
              >
                About Me
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-4 text-lg text-gray-600 dark:text-gray-300"
              >
                <p>
                  Known as &quot;Double D&quot; in the tech community, I&apos;m
                  Daniel Dada, a passionate Front-end Developer and Product
                  Designer with a unique blend of technical expertise and
                  educational experience.
                </p>
                <p>
                  Since 2020, I&apos;ve been crafting user-centric web
                  experiences and designing innovative products. As the Head of
                  Games/Instructor at Center4Tech since 2021, I combine my
                  development skills with my teaching passion to nurture the
                  next generation of tech talent.
                </p>
                <p>
                  My expertise spans front-end development, game development,
                  and product design. I&apos;ve had the privilege of teaching
                  these skills both locally and internationally through
                  platforms like Cafria Studio Hub and Techciti, reaching
                  students across Nigeria, the UK, and the US.
                </p>
              </motion.div>

              {/* Key Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Key Highlights
                </h3>
                <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                  <li>Front-end Development & Product Design (3+ years)</li>
                  <li>Game Development & Technical Instruction</li>
                  <li>International Teaching Experience (UK, US, Nigeria)</li>
                  <li>Active Tech Community Contributor</li>
                </ul>
              </motion.div>
            </div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Technical Expertise
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Development
                  </h4>
                  <div className="space-y-2">
                    {[
                      "React",
                      "Next.js",
                      "JavaScript",
                      "TypeScript",
                      "HTML5",
                      "CSS3",
                      "Tailwind CSS",
                    ].map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Design & Tools
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Figma",
                      "Adobe XD",
                      "Git",
                      "VS Code",
                      "Unity",
                      "Responsive Design",
                      "UI/UX",
                    ].map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? (
              projects.map((project, index) => {
                // Function to get image URL with fallback
                const getImageUrl = () => {
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
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={getImageUrl()}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
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
                      <div className="flex justify-between">
                        {project.githubUrl && project.githubUrl !== "private" ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            GitHub →
                          </a>
                        ) : project.githubUrl === "private" ? (
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
                        ) : null}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            Live Demo →
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                Loading projects...
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View All Projects
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
