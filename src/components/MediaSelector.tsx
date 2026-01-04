import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import MediaLibrary from './MediaLibrary';

interface MediaSelectorProps {
    onSelect: (media: any) => void;
    multiple?: boolean;
    selectedMedia?: any[];
}

export default function MediaSelector({ onSelect, multiple = false, selectedMedia = [] }: MediaSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (media: any) => {
        onSelect(media);
        if (!multiple) {
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Selected Media Preview */}
            {selectedMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedMedia.map((item: any) => (
                        <div key={item.id} className="relative group">
                            <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <Image
                                    src={item.thumbnailUrl}
                                    alt={item.caption || item.fileName}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => onSelect(multiple ? selectedMedia.filter(m => m.id !== item.id) : null)}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Select Media Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
                <svg className="w-6 h-6 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">
                    {selectedMedia.length > 0 ? 'Change Media' : 'Select Media'}
                </span>
            </button>

            {/* Media Library Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto"
                    >
                        <div className="min-h-screen px-4 text-center">
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Modal */}
                            <div className="inline-block w-full max-w-5xl my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                                <MediaLibrary
                                    onSelect={handleSelect}
                                    multiple={multiple}
                                    initialSelected={selectedMedia as any}
                                    onClose={() => setIsOpen(false)}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}