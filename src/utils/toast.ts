import { toast, Toast } from 'react-hot-toast';

interface ToastMessages {
    loading?: string;
    success?: string;
    error?: string;
}

export const notify = {
    success: (message: string): void => {
        toast.success(message, {
            id: `success-${Date.now()}`,
            duration: 3000,
        });
    },

    error: (message: string, error: Error | any | null = null): void => {
        const errorMessage = error
            ? `${message}: ${error.message || 'An error occurred'}`
            : message;

        toast.error(errorMessage, {
            id: `error-${Date.now()}`,
            duration: 4000,
        });
    },

    loading: (message: string = 'Loading...'): string => {
        return toast.loading(message, {
            id: `loading-${Date.now()}`,
        });
    },

    promise: async <T>(promise: Promise<T>, messages: ToastMessages = {}): Promise<T> => {
        const defaultMessages: Required<ToastMessages> = {
            loading: 'Loading...',
            success: 'Success!',
            error: 'An error occurred',
        };

        const finalMessages = { ...defaultMessages, ...messages };

        return toast.promise(promise, {
            loading: finalMessages.loading,
            success: finalMessages.success,
            error: (err: any) => finalMessages.error + (err.message ? `: ${err.message}` : ''),
        });
    },

    dismiss: (toastId?: string): void => {
        toast.dismiss(toastId);
    },
}; 