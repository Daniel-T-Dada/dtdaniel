'use client';

import { Skeleton } from './Skeleton';

export function NavLinkSkeleton() {
    return <Skeleton className="h-4 w-20 rounded-full" />;
}

export function NavbarSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-gray-900/10 dark:border-gray-50/[0.06] bg-white/75 dark:bg-gray-900/75 supports-backdrop-blur:bg-white/60">
            <div className="max-w-8xl mx-auto">
                <div className="py-4 px-4 lg:px-8 lg:mx-0">
                    <div className="flex items-center justify-between">
                        {/* Logo/Brand */}
                        <Skeleton className="h-8 w-32" />

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <NavLinkSkeleton key={i} />
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>

                        {/* Theme Toggle & Auth */}
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
                {/* Logo */}
                <div className="h-16 flex items-center">
                    <Skeleton className="h-8 w-32" />
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <div className="space-y-1 ml-4">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-4 w-32" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}

export function BreadcrumbSkeleton() {
    return (
        <div className="flex items-center space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center">
                    {i > 0 && <span className="mx-2 text-gray-400">/</span>}
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    );
}

const NavigationSkeletonComponent = {
    NavLinkSkeleton,
    NavbarSkeleton,
    SidebarSkeleton,
    BreadcrumbSkeleton,
};

export default NavigationSkeletonComponent; 