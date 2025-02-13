"use client";

import { useState, useEffect, useCallback } from 'react';
import Prism from 'prismjs';

// Core Prism styles and theme
import 'prismjs/themes/prism-okaidia.css'; // Using Okaidia theme for better colors

// Languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';

// Plugins
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';
import 'prismjs/plugins/show-language/prism-show-language';

const COPY_TIMEOUT = 2000; // 2 seconds

export default function CodeBlock({ code, language = 'plaintext', filename, highlightedLines = [] }) {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState('dark');

    // Theme detection
    useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        updateTheme();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Initialize Prism.js
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Configure Prism
            Prism.plugins.NormalizeWhitespace.setDefaults({
                'remove-trailing': true,
                'remove-indent': true,
                'left-trim': true,
                'right-trim': true,
            });

            // Force line numbers plugin
            if (!Prism.plugins.lineNumbers) {
                Prism.hooks.add('complete', function (env) {
                    if (!env.code) return;

                    const pre = env.element.parentNode;
                    const linesNum = env.code.split('\n').length;
                    const lineNumbersWrapper = document.createElement('span');

                    lineNumbersWrapper.className = 'line-numbers-rows';
                    lineNumbersWrapper.innerHTML = Array(linesNum + 1)
                        .join('<span></span>');

                    pre.appendChild(lineNumbersWrapper);
                });
            }

            // Highlight code
            Prism.highlightAll();
        }
    }, [code, language, theme]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), COPY_TIMEOUT);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    }, [code]);

    return (
        <div className="relative group my-6">
            {/* Filename header */}
            {filename && (
                <div className="absolute top-0 left-0 right-0 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                    <span className="font-mono">{filename}</span>
                </div>
            )}

            {/* Copy button */}
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded z-10"
                aria-label={copied ? 'Copied!' : 'Copy code'}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Code block */}
            <div className={`relative ${filename ? 'mt-12' : ''}`}>
                <pre className="line-numbers" data-start="1">
                    <code className={`language-${language} match-braces`}>
                        {code.trim()}
                    </code>
                </pre>

                {/* Highlighted lines overlay */}
                {highlightedLines.map((lineNumber) => (
                    <div
                        key={lineNumber}
                        className="absolute left-0 right-0 bg-yellow-500/10 dark:bg-yellow-300/10 pointer-events-none"
                        style={{
                            top: `${(lineNumber - 1) * 1.5}rem`,
                            height: '1.5rem',
                        }}
                    />
                ))}
            </div>
        </div>
    );
} 