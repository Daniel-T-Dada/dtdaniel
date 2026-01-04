const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`;

export function mermaidPlugin(editor: any) {
    // Register the mermaid icon
    editor.ui.registry.addIcon('diagram',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18M19 6l-6 6 6 6M5 6l6 6-6 6"/></svg>'
    );

    // Register the mermaid button
    editor.ui.registry.addButton('mermaid', {
        icon: 'diagram',
        tooltip: 'Insert Mermaid Diagram',
        onAction: () => {
            editor.windowManager.open({
                title: 'Insert Mermaid Diagram',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'textarea',
                            name: 'code',
                            label: 'Diagram Code',
                            placeholder: 'Enter your Mermaid diagram code here...',
                            value: DEFAULT_DIAGRAM
                        }
                    ]
                },
                buttons: [
                    {
                        type: 'menu',
                        text: 'Templates',
                        items: [
                            {
                                type: 'menuitem',
                                text: 'Flowchart',
                                onAction: () => {
                                    editor.windowManager.setData({
                                        code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]`
                                    });
                                }
                            },
                            {
                                type: 'menuitem',
                                text: 'Sequence',
                                onAction: () => {
                                    editor.windowManager.setData({
                                        code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob
    B->>A: Hi Alice`
                                    });
                                }
                            },
                            {
                                type: 'menuitem',
                                text: 'Class',
                                onAction: () => {
                                    editor.windowManager.setData({
                                        code: `classDiagram
    class Animal {
        +name: string
        +makeSound(): void
    }
    class Dog {
        +bark(): void
    }
    Animal <|-- Dog`
                                    });
                                }
                            }
                        ]
                    },
                    {
                        type: 'cancel',
                        text: 'Cancel'
                    },
                    {
                        type: 'submit',
                        text: 'Insert',
                        primary: true
                    }
                ],
                onSubmit: (api: any) => {
                    const data = api.getData();
                    const content = `\`\`\`mermaid\n${data.code}\n\`\`\`\n`;
                    editor.insertContent(content);
                    api.close();
                }
            });
        }
    });
}
