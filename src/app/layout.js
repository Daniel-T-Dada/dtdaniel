import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Double D - Portfolio",
  description:
    "Welcome to my professional portfolio showcasing my work and skills.",
};

export default function RootLayout({ children }) {
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
