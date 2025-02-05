"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function RootLayoutWrapper({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="min-h-screen">
        <div
          suppressHydrationWarning
          className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300"
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              className: 'toast-message',
              success: {
                icon: '✓',
                className: 'toast-success',
                style: {
                  background: '#059669',
                  color: 'white',
                  borderRadius: '8px',
                },
                duration: 3000,
              },
              error: {
                icon: '✕',
                className: 'toast-error',
                style: {
                  background: '#DC2626',
                  color: 'white',
                  borderRadius: '8px',
                },
                duration: 4000,
              },
              style: {
                background: '#1F2937',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            }}
          />
        </div>
      </main>
    </ThemeProvider>
  );
}

// Add global styles for toast animations
const style = document.createElement('style');
style.textContent = `
  .toast-message {
    animation: slideIn 0.2s ease-out;
  }

  .toast-success {
    animation: slideIn 0.2s ease-out;
  }

  .toast-error {
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
