export function embedPlugin(editor) {
    editor.ui.registry.addButton('embed', {
        text: 'Embed',
        tooltip: 'Insert media embed (YouTube, Twitter, Instagram)',
        onAction: () => {
            editor.windowManager.open({
                title: 'Insert Media Embed',
                body: {
                    type: 'panel',
                    items: [{
                        type: 'input',
                        name: 'url',
                        label: 'URL',
                        placeholder: 'Paste YouTube, Twitter, or Instagram URL'
                    }]
                },
                buttons: [
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
                onSubmit: async (api) => {
                    const url = api.getData().url;
                    if (!url) return;

                    // Insert a placeholder div that will be replaced with the actual embed
                    const embedHtml = `<div class="embed-container" data-url="${url}"></div><p></p>`;
                    editor.insertContent(embedHtml);
                    api.close();
                }
            });
        }
    });
} 