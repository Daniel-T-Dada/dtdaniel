"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Blob from "@/components/Blob";
import { motion } from "framer-motion";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    </main>
  );
}
