'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageSkeleton } from './Skeleton';

export default function OptimizedImage({
    src,
    alt,
    className = '',
    width = 1200,
    height = 630,
    priority = false,
    onError,
    aspectRatio = 'aspect-video',
    ...props
}) {
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle external URLs properly
    const isExternal = src?.startsWith('http') || src?.startsWith('https');

    // Default blur data URL for loading state
    const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshGxsdIR0hHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

    if (isError) {
        return null;
    }

    const imageComponent = isExternal ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
            onError={(e) => {
                setIsError(true);
                onError?.(e);
            }}
            onLoad={() => setIsLoading(false)}
            {...props}
        />
    ) : (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
            priority={priority}
            placeholder="blur"
            blurDataURL={blurDataURL}
            onError={(e) => {
                setIsError(true);
                onError?.(e);
            }}
            onLoadingComplete={() => setIsLoading(false)}
            {...props}
        />
    );

    return (
        <div className="relative">
            {isLoading && <ImageSkeleton aspectRatio={aspectRatio} className="absolute inset-0" />}
            {imageComponent}
        </div>
    );
} 