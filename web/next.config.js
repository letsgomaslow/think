/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for MCP handler
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
