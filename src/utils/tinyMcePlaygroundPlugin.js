const LANGUAGE_OPTIONS = [
    { text: 'JavaScript', value: 'javascript' },
    { text: 'TypeScript', value: 'typescript' },
    { text: 'Python', value: 'python' },
    { text: 'HTML', value: 'html' },
    { text: 'CSS', value: 'css' },
    { text: 'JSON', value: 'json' }
];

const DEFAULT_TEMPLATES = {
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

export function playgroundPlugin(editor) {
    // Register the playground icon
    editor.ui.registry.addIcon('code-playground',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>'
    );

    // Register the playground button
    editor.ui.registry.addButton('playground', {
        icon: 'code-playground',
        tooltip: 'Insert Code Playground',
        onAction: () => {
            editor.windowManager.open({
                title: 'Insert Code Playground',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'selectbox',
                            name: 'language',
                            label: 'Programming Language',
                            items: LANGUAGE_OPTIONS
                        },
                        {
                            type: 'checkbox',
                            name: 'readOnly',
                            label: 'Read Only'
                        },
                        {
                            type: 'input',
                            name: 'height',
                            label: 'Height',
                            placeholder: '500px'
                        },
                        {
                            type: 'textarea',
                            name: 'code',
                            label: 'Code',
                            placeholder: 'Enter your code here...',
                            minimumHeight: 200
                        }
                    ]
                },
                buttons: [
                    {
                        type: 'custom',
                        name: 'loadTemplate',
                        text: 'Load Template',
                        primary: false
                    },
                    {
                        type: 'submit',
                        text: 'Insert',
                        primary: true
                    },
                    {
                        type: 'cancel',
                        text: 'Cancel'
                    }
                ],
                initialData: {
                    language: 'javascript',
                    readOnly: true,
                    height: '500px',
                    code: DEFAULT_TEMPLATES.javascript
                },
                onAction: (dialogApi, details) => {
                    if (details.name === 'loadTemplate') {
                        const data = dialogApi.getData();
                        dialogApi.setData({
                            ...data,
                            code: DEFAULT_TEMPLATES[data.language]
                        });
                    }
                },
                onSubmit: (api) => {
                    const data = api.getData();
                    const options = {
                        language: data.language,
                        readOnly: data.readOnly,
                        height: data.height || '500px'
                    };

                    const playgroundCode =
                        '```playground ' +
                        JSON.stringify(options) +
                        '\n' + data.code + '\n' +
                        '```';

                    editor.insertContent(playgroundCode + '<p>&nbsp;</p>');
                    api.close();
                }
            });
        }
    });
} 