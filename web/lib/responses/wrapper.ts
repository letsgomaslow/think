/**
 * Response Wrapper Utility
 *
 * Wraps tool outputs in a standardized format for consistent API responses.
 */

import {
  StandardResponse,
  ResponseMetadata,
  ToolName,
  PACKAGE_VERSION,
} from './types';

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Wrap a successful tool response
 */
export function wrapSuccess<T>(
  tool: ToolName,
  data: T,
  startTime: number,
  requestId?: string
): StandardResponse<T> {
  const processingTimeMs = Date.now() - startTime;

  const metadata: ResponseMetadata = {
    tool,
    processingTimeMs,
    version: PACKAGE_VERSION,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  };

  return {
    success: true,
    tool,
    data,
    metadata,
  };
}

/**
 * Wrap an error response
 */
export function wrapError(
  tool: ToolName,
  error: Error | string,
  startTime: number,
  code: string = 'TOOL_ERROR',
  requestId?: string
): StandardResponse<null> {
  const processingTimeMs = Date.now() - startTime;
  const errorMessage = error instanceof Error ? error.message : error;

  const metadata: ResponseMetadata = {
    tool,
    processingTimeMs,
    version: PACKAGE_VERSION,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  };

  return {
    success: false,
    tool,
    data: null,
    metadata,
    error: {
      code,
      message: errorMessage,
      details: error instanceof Error ? { stack: error.stack } : undefined,
    },
  };
}

/**
 * Create a response context for tracking execution
 */
export function createResponseContext(tool: ToolName, requestId?: string) {
  const startTime = Date.now();
  const id = requestId || generateRequestId();

  return {
    tool,
    requestId: id,
    startTime,
    wrap: <T>(data: T) => wrapSuccess(tool, data, startTime, id),
    wrapError: (error: Error | string, code?: string) =>
      wrapError(tool, error, startTime, code, id),
  };
}

/**
 * Higher-order function to wrap a tool handler with standard response format
 */
export function withStandardResponse<TArgs, TResult>(
  tool: ToolName,
  handler: (args: TArgs) => Promise<TResult>
): (args: TArgs) => Promise<StandardResponse<TResult>> {
  return async (args: TArgs) => {
    const ctx = createResponseContext(tool);

    try {
      const result = await handler(args);
      return ctx.wrap(result);
    } catch (error) {
      return ctx.wrapError(
        error instanceof Error ? error : new Error(String(error)),
        'HANDLER_ERROR'
      ) as StandardResponse<TResult>;
    }
  };
}
