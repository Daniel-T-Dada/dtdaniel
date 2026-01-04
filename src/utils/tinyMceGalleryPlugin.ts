declare global {
    interface Window {
        selectedGalleryMedia: any;
    }
}

export function galleryPlugin(editor: any) {
    // Register the gallery icon
    editor.ui.registry.addIcon('gallery',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z"/></svg>'
    );

    // Register the gallery button
    editor.ui.registry.addButton('gallery', {
        icon: 'gallery',
        tooltip: 'Insert Image Gallery',
        onAction: () => {
            editor.windowManager.open({
                title: 'Insert Gallery',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'htmlpanel',
                            html: '<div id="media-selector-container" style="min-height: 400px;"></div>'
                        }
                    ]
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
                onSubmit: (api: any) => {
                    const selectedMedia = window.selectedGalleryMedia || [];
                    if (selectedMedia.length === 0) {
                        api.close();
                        return;
                    }

                    // Create gallery data structure
                    const galleryData = {
                        type: 'gallery',
                        images: selectedMedia.map((media: any) => ({
                            url: media.url,
                            caption: media.caption || '',
                            alt: media.altText || ''
                        }))
                    };

                    // Insert gallery placeholder
                    const galleryHtml = `<div class="gallery-container" data-gallery='${JSON.stringify(galleryData)}'></div><p></p>`;
                    editor.insertContent(galleryHtml);
                    window.selectedGalleryMedia = null;
                    api.close();
                }
            });

            // Initialize MediaSelector after dialog is opened
            setTimeout(() => {
                const container = document.getElementById('media-selector-container');
                if (container) {
                    const MediaSelector = editor.options.get('mediaSelector');
                    if (MediaSelector) {
                        MediaSelector.render(container, {
                            multiple: true,
                            onSelect: (media: any) => {
                                window.selectedGalleryMedia = media;
                            }
                        });
                    }
                }
            }, 100);
        }
    });
}
