"use client";

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PreloadLayoutProps {
    children: ReactNode;
}

export default function PreloadLayout({ children }: PreloadLayoutProps) {
    const pathname = usePathname();

    useEffect(() => {
        // Preload critical resources
        const preloadResources = () => {
            // Preload next page based on common navigation patterns
            const possibleNextPages = getPossibleNextPages(pathname);
            possibleNextPages.forEach(page => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'fetch';
                link.href = page;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            });

            // Preload critical images
            const criticalImages = document.querySelectorAll('img[data-priority="true"]');
            criticalImages.forEach(img => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = (img as HTMLImageElement).src;
                document.head.appendChild(link);
            });
        };

        // Add resource hints
        const addResourceHints = () => {
            // Preconnect to critical domains
            const domains = [
                'https://firebasestorage.googleapis.com',
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com'
            ];

            domains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            });

            // DNS prefetch for third-party domains
            const dnsPreloadDomains = [
                'https://www.google-analytics.com',
                'https://www.googletagmanager.com'
            ];

            dnsPreloadDomains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = domain;
                document.head.appendChild(link);
            });
        };

        preloadResources();
        addResourceHints();

        // Cleanup function to remove preload links when component unmounts
        return () => {
            document.querySelectorAll('link[rel="preload"]').forEach(link => link.remove());
        };
    }, [pathname]);

    return <>{children}</>;
}

// Helper function to determine possible next pages based on current path
function getPossibleNextPages(currentPath: string): string[] {
    const pages: string[] = [];

    if (currentPath === '/') {
        pages.push('/blog', '/projects', '/about');
    } else if (currentPath === '/blog') {
        // Add recent blog post URLs here if available
        pages.push('/');
    } else if (currentPath.startsWith('/blog/')) {
        pages.push('/blog');
    } else if (currentPath === '/projects') {
        pages.push('/', '/about');
    }

    return pages;
}
