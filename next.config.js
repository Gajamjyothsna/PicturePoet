
// next.config.js
const isProd = process.env.NODE_ENV === 'production';
const repo = 'PicturePoet'; // 👈 replace with your repo name exactly

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ enable static export
  output: 'export',

  // ✅ required for GitHub Pages (it can’t optimize images)
  images: {
    unoptimized: true,
  },

  // ✅ set correct paths when deployed on GitHub Pages
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // increase from 1MB → 10MB
      allowedOrigins: ['http://localhost:9002'], // optional: allow local dev origin
    },
  },
};

module.exports = nextConfig;
