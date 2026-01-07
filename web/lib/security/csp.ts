/**
 * Generates a cryptographically secure nonce for Content Security Policy
 *
 * Uses Web Crypto API for Edge Runtime compatibility (Vercel Edge Runtime).
 * Node.js crypto module is not available in Edge Runtime.
 *
 * A nonce is a "number used once" that allows specific inline scripts to execute
 * while maintaining CSP protection. Each nonce should be unique per request.
 *
 * @returns A base64-encoded random string suitable for CSP nonce-* directives
 */
export function generateNonce(): string {
  // Generate 16 bytes (128 bits) of cryptographically secure random data
  // Using Web Crypto API which is available in both Node.js and Edge Runtime
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Convert Uint8Array to base64 string
  // btoa() is available in both browser and Edge Runtime
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

/**
 * Type for CSP nonce value
 */
export type CSPNonce = string;
