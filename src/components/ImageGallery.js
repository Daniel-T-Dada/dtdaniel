'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ImageGallery({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const openLightbox = (index) => {
        setSelectedImage(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        const newIndex = selectedImage + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            setSelectedImage(newIndex);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!lightboxOpen) return;

        switch (e.key) {
            case 'ArrowLeft':
                navigateImage(-1);
                break;
            case 'ArrowRight':
                navigateImage(1);
                break;
            case 'Escape':
                closeLightbox();
                break;
            default:
                break;
        }
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <motion.div
                        key={index}
                        className="relative aspect-square cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={image.url}
                            alt={image.caption || `Gallery image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {image.caption && (
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-end justify-center rounded-lg">
                                <p className="text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {image.caption}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                        onClick={closeLightbox}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                            onClick={closeLightbox}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {/* Navigation buttons */}
                        {selectedImage > 0 && (
                            <button
                                className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateImage(-1);
                                }}
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                        )}
                        {selectedImage < images.length - 1 && (
                            <button
                                className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateImage(1);
                                }}
                            >
                                <ChevronRightIcon className="h-6 w-6" />
                            </button>
                        )}

                        {/* Image container */}
                        <div
                            className="relative max-w-[90vw] max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative"
                            >
                                <Image
                                    src={images[selectedImage].url}
                                    alt={images[selectedImage].caption || `Gallery image ${selectedImage + 1}`}
                                    width={1200}
                                    height={800}
                                    className="max-h-[90vh] w-auto object-contain"
                                    priority
                                />
                                {images[selectedImage].caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
                                        {images[selectedImage].caption}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
} 