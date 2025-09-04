
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // increase from 1MB → 10MB
      allowedOrigins: ['http://localhost:9002'], // optional: allow local dev origin
    },
  },
  images: {
    unoptimized: true, // optional if you don’t want Vercel’s image optimization
  },
};

module.exports = nextConfig;
