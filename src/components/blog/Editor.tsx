"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import ReactDOM from 'react-dom/client';
import MediaSelector from '@/components/MediaSelector';
// @ts-ignore
import { embedPlugin } from '@/utils/tinyMceEmbedPlugin';
// @ts-ignore
import { playgroundPlugin } from '@/utils/tinyMcePlaygroundPlugin';
// @ts-ignore
import { galleryPlugin } from '@/utils/tinyMceGalleryPlugin';
// @ts-ignore
import { chartPlugin } from '@/utils/tinyMceChartPlugin';
// @ts-ignore
import { mermaidPlugin } from '@/utils/tinyMceMermaidPlugin';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
    ssr: false,
    loading: () => <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
});

interface BlogEditorProps {
    content: string;
    setContent: (content: string) => void;
    onMediaSelect: (media: any) => void;
    selectedMedia: any[];
}

export default function BlogEditor({
    content,
    setContent,
    onMediaSelect,
    selectedMedia
}: BlogEditorProps) {
    const editorConfig = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link embed playground gallery chart mermaid | help',
        content_style: `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333;
            }
            pre {
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 4px;
                overflow-x: auto;
            }
            .embed-container {
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                max-width: 100%;
            }
            .gallery-container {
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 4px;
                margin: 1em 0;
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
            }
        `,
        setup: (editor: any) => {
            playgroundPlugin(editor);
            galleryPlugin(editor);
            embedPlugin(editor);
            chartPlugin(editor);
            mermaidPlugin(editor);
        },
        mediaSelector: {
            render: (container: HTMLElement, options: any) => {
                const root = ReactDOM.createRoot(container);
                root.render(
                    <MediaSelector
                        onSelect={options.onSelect}
                        multiple={options.multiple}
                    />
                );
                return {
                    destroy: () => {
                        root.unmount();
                    }
                };
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Content *
                </label>
                <button
                    type="button"
                    onClick={() => {
                        const testContent = `
<h2>Introduction</h2>
<p>This is a test post to demonstrate the enhanced code block features. We'll look at different programming languages and formatting options.</p>

<h2>JavaScript Example</h2>
<p>Here's a simple JavaScript function with some comments:</p>

<pre class="language-javascript filename="example.js"">
// A simple function to calculate factorial
function factorial(n) {
    // Base case
    if (n <= 1) return 1;
    
    // Recursive case
    return n * factorial(n - 1);
}

// Test the function
console.log(factorial(5)); // Output: 120
</pre>

<h2>Python Example</h2>
<p>Let's look at a Python class definition:</p>

<pre class="language-python filename="person.py"">
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, my name is {self.name} and I'm {self.age} years old!"

# Create a new person
person = Person("Alice", 30)
print(person.greet())
</pre>

<h3>Testing Features</h3>
<p>This post demonstrates:</p>
<ul>
    <li>Syntax highlighting for multiple languages</li>
    <li>Copy button functionality</li>
    <li>Language indicators</li>
    <li>Filename display</li>
    <li>Line numbers</li>
</ul>`;
                        setContent(testContent);
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                    Load Test Template
                </button>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Media Gallery
                </label>
                <MediaSelector
                    onSelect={onMediaSelect}
                    multiple={true}
                    selectedMedia={selectedMedia}
                />
            </div>
            <div className="prose max-w-none">
                <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    value={content}
                    onEditorChange={(content: string) => setContent(content)}
                    init={editorConfig}
                />
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>To add code blocks:</p>
                <ol className="list-decimal ml-4 space-y-1">
                    <li>Click the {'<>'} (Code Sample) button in the toolbar</li>
                    <li>Select a language from the dropdown</li>
                    <li>Paste or type your code</li>
                    <li>Click OK to insert the code block</li>
                </ol>
            </div>
        </div>
    );
}
