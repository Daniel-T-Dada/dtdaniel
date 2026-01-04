import { TextFragment } from './processCodeBlocks';

export interface DiagramFragment {
    type: 'diagram';
    definition: string;
}

export type DiagramPart = TextFragment | DiagramFragment;

const MERMAID_REGEX = /```mermaid\s*([\s\S]*?)```/g;

export function parseMermaid(content: string): DiagramPart[] {
    const matches: DiagramPart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = MERMAID_REGEX.exec(content)) !== null) {
        // Add text before the diagram
        if (match.index > lastIndex) {
            matches.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        // Add diagram
        matches.push({
            type: 'diagram',
            definition: match[1].trim()
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last diagram
    if (lastIndex < content.length) {
        matches.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return matches;
}
