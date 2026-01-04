"use client";

import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import AnimatedElement from "@/components/AnimatedElement";
import AnimatedText, { AnimatedCharacters } from "@/components/AnimatedText";
import useScrollAnimation from "@/hooks/useScrollAnimation";

interface SkillsData {
    development: string[];
    design: string[];
    teaching: string[];
}

export default function About() {
    const skillsRef = useRef<HTMLDivElement>(null);
    const experienceRef = useRef<HTMLDivElement>(null);

    const isSkillsInView = useScrollAnimation(skillsRef);
    const isExperienceInView = useScrollAnimation(experienceRef);

    const skillsData: SkillsData = {
        development: [
            "React/Next.js",
            "TypeScript/JavaScript",
            "HTML/CSS/Tailwind",
            "Python/Django",
            "PostgreSQL/MySQL",
            "REST APIs",
            "Git/GitHub",
            "AWS/Vercel",
        ],
        design: [
            "Figma",
            "Adobe XD",
            "UI/UX Design",
            "Prototyping",
            "Wireframing",
            "Design Systems",
            "User Research",
            "Visual Design",
        ],
        teaching: [
            "Game Development",
            "Web Development",
            "Technical Training",
            "Curriculum Design",
            "Student Mentoring",
            "Workshop Facilitation",
            "Code Reviews",
            "Documentation",
        ],
    };

    return (
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
            suppressHydrationWarning
        >
            <Navbar />

            {/* Hero Section */}
            <section
                className="pt-32 pb-16 px-4 sm:px-6 lg:px-8"
                suppressHydrationWarning
            >
                <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                    <AnimatedElement animation="fadeInDown" delay={0.2}>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white text-center mb-6">
                            <AnimatedCharacters text="About Me" />
                        </h1>
                    </AnimatedElement>

                    <AnimatedElement animation="fadeInUp" delay={0.4}>
                        <div
                            className="max-w-3xl mx-auto text-center"
                            suppressHydrationWarning
                        >
                            <AnimatedText
                                text="Known as 'Double D' in the tech community, I'm a Full-stack Developer and Product Designer with expertise in both front-end and back-end development, along with a passion for teaching."
                                className="text-xl text-gray-600 dark:text-gray-300 mb-8"
                            />
                        </div>
                    </AnimatedElement>
                </div>
            </section>

            {/* Profile Section */}
            <section
                className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800"
                suppressHydrationWarning
            >
                <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                        suppressHydrationWarning
                    >
                        <AnimatedElement animation="fadeInLeft" delay={0.2}>
                            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden">
                                <Image
                                    src="/DSC07928.JPG"
                                    alt="Daniel Dada Portrait"
                                    fill
                                    className="object-cover object-top"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                        </AnimatedElement>

                        <AnimatedElement animation="fadeInRight" delay={0.4}>
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    <AnimatedCharacters text="Professional Journey" />
                                </h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                    <AnimatedText
                                        text="Since 2020, I've been building comprehensive web solutions, from robust backend systems to engaging front-end experiences. As a Full-stack Developer, I've successfully architected and deployed production applications using Django and React."
                                        className="text-lg"
                                    />
                                    <AnimatedText
                                        text="At Cente4Tech, I lead game development education while continuing to build scalable web applications. My expertise in both front-end and back-end technologies allows me to create complete, production-ready solutions that deliver real value."
                                        className="text-lg"
                                    />
                                </div>
                            </div>
                        </AnimatedElement>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section
                ref={skillsRef}
                className="py-16 px-4 sm:px-6 lg:px-8"
                suppressHydrationWarning
            >
                <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                    <AnimatedElement animation="fadeInUp" delay={0.2}>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                            <AnimatedCharacters text="Technical Skills" />
                        </h2>
                    </AnimatedElement>

                    {isSkillsInView && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {Object.entries(skillsData).map(
                                ([category, skills], categoryIndex) => (
                                    <AnimatedElement
                                        key={category}
                                        animation="fadeInUp"
                                        delay={0.3 + categoryIndex * 0.1}
                                    >
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg h-full">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                                                {category}
                                            </h3>
                                            <ul className="space-y-2">
                                                {skills.map((skill: string, index: number) => (
                                                    <AnimatedElement
                                                        key={skill}
                                                        animation="fadeInLeft"
                                                        delay={0.1 * index}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {skill}
                                                        </span>
                                                    </AnimatedElement>
                                                ))}
                                            </ul>
                                        </div>
                                    </AnimatedElement>
                                )
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Experience Section */}
            <section
                ref={experienceRef}
                className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800"
                suppressHydrationWarning
            >
                <div className="max-w-7xl mx-auto" suppressHydrationWarning>
                    <AnimatedElement animation="fadeInUp">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                            <AnimatedCharacters text="Professional Journey" />
                        </h2>
                    </AnimatedElement>

                    {isExperienceInView && (
                        <div className="space-y-12">
                            <div className="relative pl-8 border-l-2 border-indigo-200 dark:border-indigo-800">
                                <div className="absolute w-4 h-4 bg-indigo-600 rounded-full -left-[9px] top-0" />
                                <div className="space-y-2">
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                        2021 - Present
                                    </span>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Head of Games/Instructor - Cente4Tech
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Leading technical education initiatives, developing
                                        comprehensive curricula, and mentoring students in
                                        full-stack development, game design, and programming
                                        fundamentals.
                                    </p>
                                </div>
                            </div>

                            <div className="relative pl-8 border-l-2 border-indigo-200 dark:border-indigo-800">
                                <div className="absolute w-4 h-4 bg-indigo-600 rounded-full -left-[9px] top-0" />
                                <div className="space-y-2">
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                        2020 - Present
                                    </span>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Full-stack Developer & Product Designer
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Architecting and developing complete web solutions using
                                        Django and React, focusing on scalable backend systems and
                                        intuitive front-end experiences. Successfully deployed
                                        production applications with robust database design and API
                                        integrations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
