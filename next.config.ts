// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Unsplash
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            // Pexels
            {
                protocol: "https",
                hostname: "images.pexels.com",
            },
            // Wikipedia / Wikimedia
            {
                protocol: "https",
                hostname: "upload.wikimedia.org",
            },
            {
                protocol: "https",
                hostname: "**.wikipedia.org",
            },
        ],
    },
};

module.exports = nextConfig;
