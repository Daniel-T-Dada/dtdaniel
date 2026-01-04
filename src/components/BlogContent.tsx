'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// @ts-ignore
import { processCodeBlocks } from '@/utils/processCodeBlocks';
// @ts-ignore
import { parseEmbed } from '@/utils/embedParser';
// @ts-ignore
import { parseCodePlayground } from '@/utils/parseCodePlayground';
// @ts-ignore
import { parseCharts } from '@/utils/parseCharts';
// @ts-ignore
import { parseMermaid } from '@/utils/parseMermaid';
import EmbedRenderer from './embeds/EmbedRenderer';

// Dynamically import CodePlayground to avoid SSR issues with Monaco Editor
const CodePlayground = dynamic(() => import('./CodePlayground'), {
    loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>,
    ssr: false
});

const ImageGallery = dynamic(() => import('./ImageGallery'), {
    loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
});

const ChartComponent = dynamic(() => import('./charts/ChartComponent'), {
    loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>,
    ssr: false
});

const MermaidDiagram = dynamic(() => import('./diagrams/MermaidDiagram'), {
    loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>,
    ssr: false
});

type ContentFragment =
    | { type: 'text'; content: string }
    | { type: 'code'; content: string; language: string }
    | { type: 'embed'; url: string }
    | { type: 'playground'; code: string; options: { language: string; readOnly?: boolean; height?: string } }
    | { type: 'gallery'; images: any[] }
    | { type: 'chart'; chartType: string; data: any; options: any }
    | { type: 'diagram'; definition: string };

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    const [processedContent, setProcessedContent] = useState<ContentFragment[]>([]);

    useEffect(() => {
        if (!content) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Process code blocks first
        const codeBlocksProcessed: ContentFragment[] = processCodeBlocks(tempDiv.innerHTML) as ContentFragment[];

        // Process embeds and playgrounds
        const fragments: ContentFragment[] = [];

        codeBlocksProcessed.forEach(fragment => {
            if (fragment.type === 'text') {
                // Check for galleries in the text
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = fragment.content;
                const galleryElements = tempDiv.querySelectorAll('.gallery-container');

                if (galleryElements.length > 0) {
                    // Process text before first gallery
                    let lastIndex = 0;
                    // @ts-ignore
                    galleryElements.forEach((galleryElement: HTMLElement) => {
                        // Add text before gallery
                        const beforeText = fragment.content.substring(lastIndex, fragment.content.indexOf(galleryElement.outerHTML, lastIndex));
                        if (beforeText.trim()) {
                            fragments.push({ type: 'text', content: beforeText });
                        }

                        // Add gallery
                        try {
                            const galleryData = JSON.parse(galleryElement.dataset.gallery || '{}');
                            fragments.push({ type: 'gallery', ...galleryData });
                        } catch (error) {
                            console.error('Failed to parse gallery data:', error);
                        }

                        lastIndex = fragment.content.indexOf(galleryElement.outerHTML, lastIndex) + galleryElement.outerHTML.length;
                    });

                    // Add remaining text after last gallery
                    const afterText = fragment.content.substring(lastIndex);
                    if (afterText.trim()) {
                        fragments.push({ type: 'text', content: afterText });
                    }
                } else {
                    // Process embeds, playgrounds, charts, and diagrams in the text
                    const embeds = parseEmbed(fragment.content);
                    const playgrounds = parseCodePlayground(fragment.content);
                    const charts = parseCharts(fragment.content);
                    const diagrams = parseMermaid(fragment.content);

                    if (embeds.length > 1 || playgrounds.length > 1 || charts.length > 1 || diagrams.length > 1) {
                        embeds.forEach((embed: any) => fragments.push(embed));
                        playgrounds.forEach((playground: any) => fragments.push(playground));
                        charts.forEach((chart: any) => fragments.push(chart));
                        diagrams.forEach((diagram: any) => fragments.push(diagram));
                    } else {
                        fragments.push(fragment);
                    }
                }
            } else {
                fragments.push(fragment);
            }
        });

        setProcessedContent(fragments);
    }, [content]);

    return (
        <div className="prose dark:prose-invert max-w-none">
            {processedContent.map((fragment, index) => {
                switch (fragment.type) {
                    case 'text':
                        return <div key={index} dangerouslySetInnerHTML={{ __html: fragment.content }} />;
                    case 'code':
                        return (
                            <pre key={index} className={`language-${fragment.language}`}>
                                <code>{fragment.content}</code>
                            </pre>
                        );
                    case 'embed':
                        return <EmbedRenderer key={index} url={fragment.url} />;
                    case 'playground':
                        return (
                            <CodePlayground
                                key={index}
                                initialCode={fragment.code}
                                initialLanguage={fragment.options.language}
                                readOnly={fragment.options.readOnly}
                                height={fragment.options.height}
                            />
                        );
                    case 'gallery':
                        return <ImageGallery key={index} images={fragment.images} />;
                    case 'chart':
                        return (
                            <ChartComponent
                                key={index}
                                type={fragment.chartType}
                                data={fragment.data}
                                options={fragment.options}
                            />
                        );
                    case 'diagram':
                        return <MermaidDiagram key={index} definition={fragment.definition} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
