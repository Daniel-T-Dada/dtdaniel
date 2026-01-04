"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";

interface RootLayoutWrapperProps {
    children: ReactNode;
}

export default function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
    // Ensure QueryClient is created only once per component mount
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
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
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                duration: 4000,
                                className: 'animate-slide-in',
                                success: {
                                    icon: '✓',
                                    className: 'bg-green-600 text-white rounded-lg',
                                    style: {
                                        borderRadius: '8px',
                                    },
                                    duration: 3000,
                                },
                                error: {
                                    icon: '✕',
                                    className: 'bg-red-600 text-white rounded-lg',
                                    style: {
                                        borderRadius: '8px',
                                    },
                                    duration: 4000,
                                },
                                style: {
                                    background: '#1F2937',
                                    color: 'white',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    maxWidth: '400px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                },
                            }}
                        />
                    </div>
                </main>
                <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
