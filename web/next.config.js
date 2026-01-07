/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for MCP handler
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  /**
   * Security Headers Configuration
   *
   * These headers provide fallback security for static assets and routes
   * where middleware cannot apply headers (e.g., _next/static, images).
   * For dynamic routes, the middleware.ts will override these with nonce-based CSP.
   *
   * Headers applied:
   * - Content-Security-Policy: Fallback CSP without nonce for static content
   * - X-Frame-Options: Prevent clickjacking
   * - X-Content-Type-Options: Prevent MIME type sniffing
   * - Referrer-Policy: Control referrer information
   * - Permissions-Policy: Disable dangerous browser features
   * - Strict-Transport-Security: Force HTTPS in production
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        // Middleware will override these for dynamic routes with nonce-based CSP
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            // Fallback CSP for static assets (without nonce)
            // This CSP is more permissive for static content but still secure
            value: [
              "default-src 'self'",
              "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
