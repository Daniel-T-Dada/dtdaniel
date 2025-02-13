"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Blog Posts", href: "/admin/blog" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-md ${isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with theme toggle and sign out */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
        <div className="flex items-center justify-between mb-4 px-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-64 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4 h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`
                    lg:hidden fixed top-0 left-0 z-40 h-full w-64 
                    transform transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    bg-white dark:bg-gray-800 shadow-lg
                `}
      >
        <div className="flex flex-col h-full p-4 pt-16">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
