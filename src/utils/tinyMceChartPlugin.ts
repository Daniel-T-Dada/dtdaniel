const CHART_TYPES = [
    { text: 'Line Chart', value: 'line' },
    { text: 'Bar Chart', value: 'bar' },
    { text: 'Pie Chart', value: 'pie' },
    { text: 'Doughnut Chart', value: 'doughnut' }
];

const DEFAULT_DATA: any = {
    line: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Sample Data',
            data: [65, 59, 80, 81, 56],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    bar: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [{
            label: 'Sample Data',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ]
        }]
    },
    pie: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ]
        }]
    },
    doughnut: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ]
        }]
    }
};

export function chartPlugin(editor: any) {
    // Register the chart icon
    editor.ui.registry.addIcon('chart',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>'
    );

    // Register the chart button
    editor.ui.registry.addButton('chart', {
        icon: 'chart',
        tooltip: 'Insert Chart',
        onAction: () => {
            editor.windowManager.open({
                title: 'Insert Chart',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'selectbox',
                            name: 'type',
                            label: 'Chart Type',
                            items: CHART_TYPES
                        },
                        {
                            type: 'input',
                            name: 'title',
                            label: 'Chart Title'
                        },
                        {
                            type: 'textarea',
                            name: 'data',
                            label: 'Chart Data (JSON)',
                            placeholder: 'Enter chart data in JSON format...'
                        }
                    ]
                },
                buttons: [
                    {
                        type: 'custom',
                        name: 'loadSample',
                        text: 'Load Sample Data'
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
                    type: 'line',
                    title: 'Sample Chart',
                    data: JSON.stringify(DEFAULT_DATA.line, null, 2)
                },
                onAction: (dialogApi: any, details: any) => {
                    if (details.name === 'loadSample') {
                        const type = dialogApi.getData().type;
                        dialogApi.setData({
                            ...dialogApi.getData(),
                            data: JSON.stringify(DEFAULT_DATA[type], null, 2)
                        });
                    }
                },
                onSubmit: (api: any) => {
                    const data = api.getData();
                    try {
                        // Validate JSON data
                        const chartData = JSON.parse(data.data);

                        // Create chart code block
                        const chartCode =
                            '```chart ' +
                            JSON.stringify({ type: data.type, title: data.title }) +
                            '\n' +
                            JSON.stringify(chartData, null, 2) +
                            '\n```';

                        editor.insertContent(chartCode + '<p>&nbsp;</p>');
                        api.close();
                    } catch (error) {
                        editor.notificationManager.open({
                            text: 'Invalid JSON data format',
                            type: 'error'
                        });
                    }
                }
            });
        }
    });
}
