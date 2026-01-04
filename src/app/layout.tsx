import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Double D - Portfolio",
    description:
        "Welcome to my professional portfolio showcasing my work and skills.",
    icons: {
        icon: [
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script id="theme-script" strategy="beforeInteractive">
                    {`
            try {
              let isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', isDark);
            } catch (e) {}
          `}
                </Script>
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <RootLayoutWrapper>{children}</RootLayoutWrapper>
            </body>
        </html>
    );
}
