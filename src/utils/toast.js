import { toast } from 'react-hot-toast';

export const notify = {
    success: (message) => {
        toast.success(message, {
            id: `success-${Date.now()}`,
            duration: 3000,
        });
    },

    error: (message, error = null) => {
        const errorMessage = error
            ? `${message}: ${error.message || 'An error occurred'}`
            : message;

        toast.error(errorMessage, {
            id: `error-${Date.now()}`,
            duration: 4000,
        });
    },

    loading: (message = 'Loading...') => {
        return toast.loading(message, {
            id: `loading-${Date.now()}`,
        });
    },

    promise: async (promise, messages = {}) => {
        const defaultMessages = {
            loading: 'Loading...',
            success: 'Success!',
            error: 'An error occurred',
        };

        const finalMessages = { ...defaultMessages, ...messages };

        return toast.promise(promise, {
            loading: finalMessages.loading,
            success: finalMessages.success,
            error: (err) => finalMessages.error + (err.message ? `: ${err.message}` : ''),
        });
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
}; 