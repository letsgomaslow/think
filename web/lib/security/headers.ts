import type { CSPNonce } from './csp';

/**
 * Content Security Policy directives configuration
 *
 * CSP helps prevent XSS attacks by controlling which resources can be loaded
 * and executed on the page. The nonce-based approach allows specific inline
 * scripts while blocking all others.
 */
interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'form-action': string[];
  'object-src': string[];
}

/**
 * Security headers configuration
 */
export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

/**
 * CSP directives template with nonce placeholder
 *
 * The {{NONCE}} placeholder will be replaced with an actual nonce value
 * by the middleware on each request.
 */
const cspDirectives: CSPDirectives = {
  // Default policy - restrict to same origin
  'default-src': ["'self'"],

  // Script sources - allow self, Google Analytics, and nonce-based inline scripts
  'script-src': [
    "'self'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    "'nonce-{{NONCE}}'", // Placeholder for dynamic nonce
  ],

  // Style sources - allow self, inline styles (for Tailwind), and Google Fonts
  // Note: 'unsafe-inline' is needed for Tailwind's runtime style injection
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],

  // Image sources - allow self, data URIs, and Google Analytics
  'img-src': [
    "'self'",
    'data:',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ],

  // Font sources - allow self and Google Fonts
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],

  // Connection sources - allow self and Google Analytics
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ],

  // Frame ancestors - prevent embedding in iframes (clickjacking protection)
  'frame-ancestors': ["'none'"],

  // Base URI - restrict base tag to same origin
  'base-uri': ["'self'"],

  // Form actions - restrict form submissions to same origin
  'form-action': ["'self'"],

  // Object sources - block plugins like Flash
  'object-src': ["'none'"],
};

/**
 * Converts CSP directives object to a CSP header string
 *
 * @param nonce - Optional nonce value to replace the {{NONCE}} placeholder
 * @returns CSP header value as a string
 */
export function buildCSPHeader(nonce?: CSPNonce): string {
  const directives = Object.entries(cspDirectives)
    .map(([key, values]) => {
      const valueString = values.join(' ');
      // Replace nonce placeholder if nonce is provided
      const processedValue = nonce
        ? valueString.replace('{{NONCE}}', nonce)
        : valueString.replace("'nonce-{{NONCE}}'", ''); // Remove nonce directive if no nonce
      return `${key} ${processedValue}`;
    })
    .join('; ');

  return directives;
}

/**
 * Other security headers (non-CSP)
 *
 * These headers provide additional security layers:
 * - X-Frame-Options: Prevents clickjacking by blocking iframe embedding
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - Referrer-Policy: Controls referrer information sent with requests
 * - Permissions-Policy: Controls browser features and APIs
 * - Strict-Transport-Security: Forces HTTPS connections
 */
const otherSecurityHeaders = {
  // Prevent the page from being embedded in iframes
  'X-Frame-Options': 'DENY',

  // Prevent browsers from MIME-sniffing responses
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information - send origin on cross-origin requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Disable potentially dangerous browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Force HTTPS for 2 years, including all subdomains
  // Note: Only applied in production (middleware should check environment)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

/**
 * Builds complete set of security headers with CSP nonce
 *
 * @param nonce - CSP nonce value for inline scripts
 * @returns Object containing all security headers
 */
export function buildSecurityHeaders(nonce: CSPNonce): SecurityHeaders {
  return {
    'Content-Security-Policy': buildCSPHeader(nonce),
    ...otherSecurityHeaders,
  };
}

/**
 * Builds security headers for static routes (without nonce)
 *
 * This is used for routes that don't need inline scripts, such as
 * static assets, API routes, etc.
 *
 * @returns Object containing all security headers without nonce-based CSP
 */
export function buildStaticSecurityHeaders(): Omit<SecurityHeaders, 'Strict-Transport-Security'> {
  return {
    'Content-Security-Policy': buildCSPHeader(),
    'X-Frame-Options': otherSecurityHeaders['X-Frame-Options'],
    'X-Content-Type-Options': otherSecurityHeaders['X-Content-Type-Options'],
    'Referrer-Policy': otherSecurityHeaders['Referrer-Policy'],
    'Permissions-Policy': otherSecurityHeaders['Permissions-Policy'],
  };
}

/**
 * Export CSP directives for inspection/testing
 */
export { cspDirectives };
