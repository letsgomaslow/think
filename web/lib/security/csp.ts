import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure nonce for Content Security Policy
 *
 * A nonce is a "number used once" that allows specific inline scripts to execute
 * while maintaining CSP protection. Each nonce should be unique per request.
 *
 * @returns A base64-encoded random string suitable for CSP nonce-* directives
 */
export function generateNonce(): string {
  // Generate 16 bytes (128 bits) of cryptographically secure random data
  // This provides sufficient entropy for a unique nonce per request
  return randomBytes(16).toString('base64');
}

/**
 * Type for CSP nonce value
 */
export type CSPNonce = string;
