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
            {
                protocol: "https",
                hostname: "pixabay.com",
            },
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
