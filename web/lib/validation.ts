import { z } from 'zod';

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts: < > & " ' to HTML entities
 * @param text - The text to escape
 * @returns The escaped text safe for HTML rendering
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  return text.replace(/[<>&"']/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitizes and validates a name input
 * - Trims whitespace
 * - Returns null for empty or whitespace-only names
 * - Validates length (max 100 characters)
 * - Escapes HTML characters to prevent XSS
 * @param name - The name to sanitize
 * @returns The sanitized name or null if invalid/empty
 */
export function sanitizeName(name: string | null | undefined): string | null {
  // Return null for falsy values
  if (!name) {
    return null;
  }

  // Trim whitespace
  const trimmed = name.trim();

  // Return null for empty strings after trimming
  if (trimmed.length === 0) {
    return null;
  }

  // Return null if exceeds maximum length
  if (trimmed.length > 100) {
    return null;
  }

  // Escape HTML characters and return
  return escapeHtml(trimmed);
}

/**
 * Zod schema for name validation
 * - Must be a string
 * - Must be between 1 and 100 characters (after trimming)
 * - Automatically trims whitespace
 */
export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name must not be empty')
  .max(100, 'Name must be 100 characters or less');

/**
 * Type for validated name
 */
export type ValidatedName = z.infer<typeof nameSchema>;
