"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function RootLayoutWrapper({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="min-h-screen">
        <div
          suppressHydrationWarning
          className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300"
        >
          {children}
          <Toaster position="bottom-right" />
        </div>
      </main>
    </ThemeProvider>
  );
}
