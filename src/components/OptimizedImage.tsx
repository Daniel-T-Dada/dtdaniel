"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedImageData, generateSrcSet, getSizes, shouldLazyLoad, getImagePriority } from '@/utils/imageOptimizer';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    index?: number;
    isHero?: boolean;
    priority?: boolean;
}

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    index = 0,
    isHero = false,
    priority: forcePriority = false,
}: OptimizedImageProps) {
    const [imageData, setImageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadImageData() {
            try {
                const data = await getOptimizedImageData(src);
                setImageData(data);
            } catch (err) {
                console.error('Error loading image:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (src) {
            loadImageData();
        }
    }, [src]);

    if (!src || error) {
        return (
            <div
                className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
                style={{ width, height }}
                role="img"
                aria-label={alt}
            />
        );
    }

    if (loading) {
        return (
            <div
                className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
                style={{ width, height }}
            />
        );
    }

    const priority = forcePriority || getImagePriority(index, isHero);
    const shouldLazy = shouldLazyLoad(index, priority);
    const sizes = getSizes();
    // srcSet is not used by Next.js Image component directly like this, but logic was in original code.
    // Normalized Image component in Next handles srcSet automatically.
    // However, if generateSrcSet does something specific for Firebase, we might want to check it.
    // In original code, srcSet variable was generated but NOT passed to Image component props!
    // It was just unused variable. I will keep it but comment on it if needed.
    // const srcSet = generateSrcSet(src); 

    return (
        <div className={`relative ${className}`}>
            <Image
                {...imageData}
                alt={alt}
                width={width}
                height={height}
                className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                priority={priority}
                loading={shouldLazy ? 'lazy' : 'eager'}
                sizes={`(max-width: 640px) ${sizes.default}, 
                        (max-width: 768px) ${sizes.sm}, 
                        (max-width: 1024px) ${sizes.md}, 
                        ${sizes.lg}`}
                quality={90}
                onLoadingComplete={() => setLoading(false)}
                onError={() => setError(true)}
            />
        </div>
    );
}
