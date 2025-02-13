export function processCodeBlocks(content) {
    // Match code blocks with optional language and filename
    const codeBlockRegex = /```(\w+)?(?:\:([^\n]+))?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        // Extract code block information
        const [, language, filename, code] = match;

        // Add code block
        parts.push({
            type: 'code',
            language: language || 'plaintext',
            filename: filename || '',
            code: code.trim(),
            highlightedLines: [] // Can be extended to support line highlighting syntax
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return parts;
} 