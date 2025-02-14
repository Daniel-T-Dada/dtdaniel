'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const DEFAULT_LANGUAGE = 'javascript';
const DEFAULT_CODE = `// Write your code here
function example() {
    console.log("Hello, World!");
}`;

const SUPPORTED_LANGUAGES = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'json', label: 'JSON' },
];

const LANGUAGE_TEMPLATES = {
    javascript: `// Write your JavaScript code here
function example() {
    console.log("Hello, World!");
}`,
    typescript: `// Write your TypeScript code here
interface Example {
    message: string;
}

function greet(data: Example): void {
    console.log(data.message);
}`,
    python: `# Write your Python code here
def example():
    print("Hello, World!")`,
    html: `<!-- Write your HTML code here -->
<!DOCTYPE html>
<html>
<head>
    <title>Example</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
    css: `/* Write your CSS code here */
.example {
    color: blue;
    font-size: 16px;
}`,
    json: `{
    "example": {
        "message": "Hello, World!",
        "value": 42
    }
}`
};

export default function CodePlayground({
    initialCode = DEFAULT_CODE,
    initialLanguage = DEFAULT_LANGUAGE,
    readOnly = false,
    height = "500px"
}) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { theme } = useTheme();
    const iframeRef = useRef(null);

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        setCode(LANGUAGE_TEMPLATES[newLanguage]);
        setOutput('');
        setError('');
    };

    // Handle code execution
    const runCode = async () => {
        setIsRunning(true);
        setOutput('');
        setError('');

        try {
            if (language === 'javascript') {
                // Create a sandbox iframe for JavaScript execution
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                const iframeWindow = iframe.contentWindow;
                const consoleLogs = [];

                // Override console.log
                iframeWindow.console.log = (...args) => {
                    consoleLogs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' '));
                };

                try {
                    iframeWindow.eval(code);
                    setOutput(consoleLogs.join('\n'));
                } catch (err) {
                    setError(err.toString());
                }

                document.body.removeChild(iframe);
            } else if (language === 'html') {
                // For HTML, display in iframe
                if (iframeRef.current) {
                    const iframe = iframeRef.current;
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(code);
                    iframeDoc.close();
                }
            } else {
                setOutput('Code execution is simulated for this language.');
            }
        } catch (err) {
            setError(err.toString());
        } finally {
            setIsRunning(false);
        }
    };

    // Handle code sharing
    const shareCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            // You could implement a more sophisticated sharing mechanism here
            alert('Code copied to clipboard!');
        } catch (err) {
            console.error('Failed to share code:', err);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm"
                        disabled={readOnly}
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    {!readOnly && (
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                    )}
                    <button
                        onClick={shareCode}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Share
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="relative">
                <Editor
                    height={height}
                    language={language}
                    value={code}
                    onChange={setCode}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on'
                    }}
                />
            </div>

            {/* Output/Preview */}
            <AnimatePresence>
                {(output || error || language === 'html') && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {language === 'html' ? 'Preview' : 'Output'}
                            </h3>
                            {language === 'html' ? (
                                <iframe
                                    ref={iframeRef}
                                    title="HTML Preview"
                                    className="w-full h-[300px] border-0 bg-white"
                                    sandbox="allow-scripts"
                                />
                            ) : error ? (
                                <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </pre>
                            ) : (
                                <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm">
                                    {output}
                                </pre>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 