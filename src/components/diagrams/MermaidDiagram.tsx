"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with default config
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    themeVariables: {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }
});

interface MermaidDiagramProps {
    definition: string;
    className?: string;
}

export default function MermaidDiagram({ definition, className = '' }: MermaidDiagramProps) {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                // Generate a unique ID for the diagram
                const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                const { svg } = await mermaid.render(id, definition);
                setSvg(svg);
                setError(null);
            } catch (err) {
                console.error('Error rendering mermaid diagram:', err);
                setError('Failed to render diagram. Please check your syntax.');
            }
        };

        if (definition) {
            renderDiagram();
        }
    }, [definition]);

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {definition}
                </pre>
            </div>
        );
    }

    return (
        <div
            ref={elementRef}
            className={`overflow-x-auto bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
