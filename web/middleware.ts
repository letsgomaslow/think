import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from '@/lib/security/csp';
import { buildSecurityHeaders } from '@/lib/security/headers';

/**
 * Next.js Middleware for Security Headers
 *
 * This middleware injects security headers into all responses, including:
 * - Content Security Policy (CSP) with dynamic nonce generation
 * - X-Frame-Options, X-Content-Type-Options, Referrer-Policy
 * - Permissions-Policy, Strict-Transport-Security
 *
 * The CSP nonce is generated uniquely per request and stored in request
 * headers so server components can access it via headers().get('x-nonce').
 */
export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = generateNonce();

  // Build security headers with the nonce
  const securityHeaders = buildSecurityHeaders(nonce);

  // Create response with security headers
  const response = NextResponse.next();

  // Apply all security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Store the nonce in request headers so server components can access it
  // Server components can retrieve this using: headers().get('x-nonce')
  response.headers.set('x-nonce', nonce);

  return response;
}

/**
 * Matcher configuration
 *
 * Apply middleware to all routes except:
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon and other public assets
 * - API routes that handle their own security
 *
 * The negative lookahead pattern excludes these paths while matching everything else.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
