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
            }
        ],
    },
};

export default nextConfig;
