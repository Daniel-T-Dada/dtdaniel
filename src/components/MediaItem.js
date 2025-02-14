import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function MediaItem({ item, onSelect, onEdit, onDelete, isSelected, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group"
            layoutId={item.id}
        >
            <div className="aspect-square relative rounded-lg border border-gray-200 dark:border-gray-700 group">
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <Image
                        src={item.thumbnailUrl}
                        alt={item.caption || item.fileName}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        priority={index === 0}
                        className={`object-cover transition-transform duration-200 ${isSelected ? 'scale-95' : 'group-hover:scale-105'
                            }`}
                    />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(item);
                            }}
                            className={`w-10 h-10 flex items-center justify-center ${isSelected
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                                } rounded-full transition-all shadow-lg transform hover:scale-110 hover:shadow-xl`}
                            title={isSelected ? 'Selected' : 'Select'}
                        >
                            {isSelected ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all shadow-lg transform hover:scale-110 hover:shadow-xl"
                            title="Edit"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id, item.fileName);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white text-red-600 rounded-full hover:bg-red-50 transition-all shadow-lg transform hover:scale-110 hover:shadow-xl"
                            title="Delete"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
                {isSelected && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    </div>
                )}
            </div>
            {item.caption && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.caption}
                </p>
            )}
            {item.tags && item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default memo(MediaItem); 