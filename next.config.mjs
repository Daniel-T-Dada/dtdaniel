/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "via.placeholder.com",
            },
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
            },
            {
                protocol: "https",
                hostname: "*.firebasestorage.googleapis.com",
            },
            {
                protocol: "https",
                hostname: "*.fna.fbcdn.net",
            },
            {
                protocol: "https",
                hostname: "scontent.flos1-3.fna.fbcdn.net",
            },
            {
                protocol: "https",
                hostname: "*.fbcdn.net",
            },
            {
                protocol: "https",
                hostname: "www.bursys.com",
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp', 'image/avif'],
    },
    // Enable React Strict Mode for better development experience
    reactStrictMode: true,
    // Configure resource hints
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Link',
                        value: [
                            '<https://fonts.googleapis.com>; rel=preconnect',
                            '<https://fonts.gstatic.com>; rel=preconnect',
                            '<https://firebasestorage.googleapis.com>; rel=preconnect',
                        ].join(', '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
