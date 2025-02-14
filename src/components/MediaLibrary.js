'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMedia, getMediaLibrary, deleteMedia, updateMediaMetadata, searchMedia } from '@/utils/mediaManager';
import { toast } from 'react-hot-toast';
import MediaItem from './MediaItem';

export default function MediaLibrary({ onSelect, multiple = false, initialSelected = [], uploadedFiles = [], onClose }) {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(initialSelected);
    const [editingItem, setEditingItem] = useState(null);
    const [filters, setFilters] = useState({ type: '', tags: [] });
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        loadMediaLibrary();
    }, [loadMediaLibrary]);

    // Extract unique tags from media items
    useEffect(() => {
        const tags = new Set();
        mediaItems.forEach(item => {
            item.tags?.forEach(tag => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));
    }, [mediaItems]);

    const loadMediaLibrary = useCallback(async () => {
        try {
            setLoading(true);
            const items = await getMediaLibrary(filters);
            setMediaItems(items);
        } catch (error) {
            console.error('Error loading media library:', error);
            toast.error('Failed to load media library');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => uploadMedia(file));
            const results = await Promise.all(uploadPromises);

            setMediaItems(prev => [...results, ...prev]);
            toast.success(`Successfully uploaded ${files.length} file(s)`);
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = useCallback(async (mediaId, fileName) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await deleteMedia(mediaId, fileName);
            setMediaItems(prev => prev.filter(item => item.id !== mediaId));
            setSelectedItems(prev => prev.filter(item => item.id !== mediaId));
            toast.success('Media deleted successfully');
            await loadMediaLibrary();
        } catch (error) {
            console.error('Error deleting media:', error);
            toast.error('Failed to delete media');
        }
    }, [loadMediaLibrary]);

    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) {
            loadMediaLibrary();
            return;
        }

        try {
            setLoading(true);
            const results = await searchMedia(searchTerm);
            setMediaItems(results);
        } catch (error) {
            console.error('Error searching media:', error);
            toast.error('Failed to search media');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, loadMediaLibrary]);

    const handleSelect = useCallback((item) => {
        if (!multiple) {
            onSelect(item);
            onClose?.();
            return;
        }

        setSelectedItems(prev => {
            const isSelected = prev.some(selected => selected.id === item.id);
            const newSelection = isSelected
                ? prev.filter(selected => selected.id !== item.id)
                : [...prev, item];

            // Call onSelect with the updated selection
            onSelect(newSelection);
            return newSelection;
        });
    }, [multiple, onSelect, onClose]);

    const handleUpdateMetadata = async (mediaId, metadata) => {
        try {
            await updateMediaMetadata(mediaId, metadata);
            setMediaItems(prev => prev.map(item =>
                item.id === mediaId
                    ? { ...item, ...metadata }
                    : item
            ));
            setEditingItem(null);
            toast.success('Metadata updated successfully');
        } catch (error) {
            console.error('Error updating metadata:', error);
            toast.error('Failed to update metadata');
        }
    };

    const handleTagFilter = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Media Library
                </h2>
                <div className="flex items-center gap-4">
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                        Upload Files
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                    {multiple && (
                        <button
                            onClick={() => {
                                onSelect(selectedItems);
                                onClose?.();
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            disabled={selectedItems.length === 0}
                        >
                            Insert Selected ({selectedItems.length})
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search media..."
                            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Search
                    </button>
                </div>
                {availableTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagFilter(tag)}
                                className={`px-3 py-1 rounded-full text-sm ${filters.tags.includes(tag)
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    } hover:bg-opacity-75 transition-colors`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                    {mediaItems.map((item, index) => (
                        <MediaItem
                            key={item.id}
                            item={{
                                ...item,
                                fileName: item.fileName || item.originalName // Fallback to originalName if fileName is not available
                            }}
                            index={index}
                            isSelected={selectedItems.some(selected => selected.id === item.id)}
                            onSelect={handleSelect}
                            onEdit={setEditingItem}
                            onDelete={handleDelete}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && mediaItems.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        No media items found
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Edit Media Details</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleUpdateMetadata(editingItem.id, {
                                caption: formData.get('caption'),
                                altText: formData.get('altText'),
                                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean)
                            });
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Caption</label>
                                    <input
                                        type="text"
                                        name="caption"
                                        defaultValue={editingItem.caption}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alt Text</label>
                                    <input
                                        type="text"
                                        name="altText"
                                        defaultValue={editingItem.altText}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        defaultValue={editingItem.tags?.join(', ')}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 