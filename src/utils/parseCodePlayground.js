const PLAYGROUND_REGEX = /```playground\s*\{([^}]+)\}([^`]+)```/g;

export function parseCodePlayground(content) {
    const matches = [];
    let lastIndex = 0;
    let match;

    while ((match = PLAYGROUND_REGEX.exec(content)) !== null) {
        // Add text before the playground
        if (match.index > lastIndex) {
            matches.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        try {
            // Parse playground options
            const options = JSON.parse(`{${match[1]}}`);

            // Add playground with parsed options and code
            matches.push({
                type: 'playground',
                options: {
                    language: options.language || 'javascript',
                    readOnly: options.readOnly !== false, // Default to true
                    height: options.height || '500px'
                },
                code: match[2].trim()
            });
        } catch (error) {
            console.error('Error parsing playground options:', error);
            // If parsing fails, treat it as regular code block
            matches.push({
                type: 'text',
                content: match[0]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last playground
    if (lastIndex < content.length) {
        matches.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return matches;
} 