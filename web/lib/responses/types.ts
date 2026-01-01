/**
 * Standardized Response Format Types
 *
 * Defines the standard response wrapper for all think-mcp tool outputs.
 * Ensures consistent structure for easier parsing and integration.
 */

/**
 * Metadata included with every response
 */
export interface ResponseMetadata {
  /** Tool that generated this response */
  tool: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** think-mcp version */
  version: string;
  /** Timestamp of response generation */
  timestamp: string;
  /** Request ID for tracing (if available) */
  requestId?: string;
}

/**
 * Standard response wrapper for all tool outputs
 */
export interface StandardResponse<T = unknown> {
  /** Whether the tool execution succeeded */
  success: boolean;
  /** Name of the tool */
  tool: string;
  /** The actual tool output data */
  data: T;
  /** Response metadata */
  metadata: ResponseMetadata;
  /** Error information if success is false */
  error?: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: Record<string, unknown>;
  };
}

/**
 * Tool names for type safety
 */
export type ToolName =
  | 'trace'
  | 'model'
  | 'pattern'
  | 'paradigm'
  | 'debug'
  | 'council'
  | 'decide'
  | 'reflect'
  | 'hypothesis'
  | 'debate'
  | 'map';

/**
 * Package version (should match package.json)
 */
export const PACKAGE_VERSION = '2.0.0';
