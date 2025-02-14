import { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ChartComponent({ type, data, options = {} }) {
    const chartRef = useRef(null);

    // Default options for better appearance
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: data.title || '',
            },
        },
    };

    // Merge default options with provided options
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
            ...defaultOptions.plugins,
            ...options.plugins,
        },
    };

    const renderChart = () => {
        switch (type.toLowerCase()) {
            case 'line':
                return <Line ref={chartRef} data={data} options={mergedOptions} />;
            case 'bar':
                return <Bar ref={chartRef} data={data} options={mergedOptions} />;
            case 'pie':
                return <Pie ref={chartRef} data={data} options={mergedOptions} />;
            case 'doughnut':
                return <Doughnut ref={chartRef} data={data} options={mergedOptions} />;
            default:
                return <div>Unsupported chart type</div>;
        }
    };

    return (
        <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            {renderChart()}
        </div>
    );
} 