const CHART_REGEX = /```chart\s*\{([^}]+)\}([^`]+)```/g;

export function parseCharts(content) {
    const matches = [];
    let lastIndex = 0;
    let match;

    while ((match = CHART_REGEX.exec(content)) !== null) {
        // Add text before the chart
        if (match.index > lastIndex) {
            matches.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        try {
            // Parse chart options and data
            const options = JSON.parse(`{${match[1]}}`);
            const chartData = JSON.parse(match[2]);

            // Add chart with parsed options and data
            matches.push({
                type: 'chart',
                chartType: options.type || 'line',
                data: {
                    ...chartData,
                    title: options.title
                },
                options: {
                    ...options,
                    // Remove type and title from options as they're handled separately
                    type: undefined,
                    title: undefined
                }
            });
        } catch (error) {
            console.error('Error parsing chart data:', error);
            // If parsing fails, treat it as regular text
            matches.push({
                type: 'text',
                content: match[0]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last chart
    if (lastIndex < content.length) {
        matches.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return matches;
} 