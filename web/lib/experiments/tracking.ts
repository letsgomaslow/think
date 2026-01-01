/**
 * Experiment Tracking Utilities
 *
 * Provides structured logging for A/B test events that can be
 * filtered and analyzed in Vercel logs.
 */

import {
  ExperimentEvent,
  ExperimentEventType,
  PromptVariant,
} from './types';
import { getExperimentConfig } from './config';

/**
 * Log prefix for filtering in Vercel logs
 */
const LOG_PREFIX = '[experiment]';

/**
 * Create and log an experiment event
 */
async function logEvent(event: ExperimentEvent): Promise<void> {
  const config = await getExperimentConfig();

  // Skip if tracking is disabled
  if (!config.features.enableTracking) {
    return;
  }

  // Structured JSON log for Vercel log filtering
  console.log(
    LOG_PREFIX,
    JSON.stringify({
      ...event,
      configVersion: config.version,
    })
  );
}

/**
 * Track when a user is exposed to an experiment variant
 *
 * Call this when a user first sees a prompt, resource, or progress update
 * that differs by variant.
 */
export async function trackExposure(params: {
  tool: string;
  variant: PromptVariant;
  sessionId?: string;
  context?: string;
}): Promise<void> {
  await logEvent({
    type: 'exposure',
    tool: params.tool,
    variant: params.variant,
    sessionId: params.sessionId,
    metadata: {
      context: params.context,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when a user completes a tool flow successfully
 *
 * Call this when a tool execution completes without errors.
 */
export async function trackCompletion(params: {
  tool: string;
  variant: PromptVariant;
  sessionId?: string;
  duration?: number;
  steps?: number;
}): Promise<void> {
  await logEvent({
    type: 'completion',
    tool: params.tool,
    variant: params.variant,
    sessionId: params.sessionId,
    metadata: {
      durationMs: params.duration,
      stepCount: params.steps,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when an error occurs during tool execution
 *
 * Call this when a tool execution fails or encounters validation errors.
 */
export async function trackError(params: {
  tool: string;
  variant: PromptVariant;
  sessionId?: string;
  errorType: string;
  errorMessage?: string;
}): Promise<void> {
  await logEvent({
    type: 'error',
    tool: params.tool,
    variant: params.variant,
    sessionId: params.sessionId,
    metadata: {
      errorType: params.errorType,
      errorMessage: params.errorMessage,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when a user returns to use a tool again (retention)
 *
 * Call this when a returning session uses the same tool.
 */
export async function trackRetention(params: {
  tool: string;
  variant: PromptVariant;
  sessionId: string;
  daysSinceLast?: number;
}): Promise<void> {
  await logEvent({
    type: 'retention',
    tool: params.tool,
    variant: params.variant,
    sessionId: params.sessionId,
    metadata: {
      daysSinceLast: params.daysSinceLast,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when a user achieves a conversion goal
 *
 * Call this for specific success metrics like:
 * - Completing a full analysis chain (trace → model → reflect)
 * - Reaching a decision in the decide tool
 * - Successfully synthesizing contributions in council
 */
export async function trackConversion(params: {
  tool: string;
  variant: PromptVariant;
  sessionId?: string;
  conversionType: string;
  value?: number;
}): Promise<void> {
  await logEvent({
    type: 'conversion',
    tool: params.tool,
    variant: params.variant,
    sessionId: params.sessionId,
    metadata: {
      conversionType: params.conversionType,
      value: params.value,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a tracking context for a tool execution
 *
 * Returns a set of pre-bound tracking functions for a specific
 * tool and session, reducing boilerplate in tool handlers.
 */
export function createTrackingContext(params: {
  tool: string;
  sessionId?: string;
}) {
  let variant: PromptVariant = 'A';
  let startTime: number | undefined;

  return {
    /**
     * Initialize tracking with the current variant
     * Call this at the start of tool execution
     */
    async start(currentVariant: PromptVariant): Promise<void> {
      variant = currentVariant;
      startTime = Date.now();
      await trackExposure({
        tool: params.tool,
        variant,
        sessionId: params.sessionId,
      });
    },

    /**
     * Track successful completion
     * Call this when the tool execution succeeds
     */
    async complete(steps?: number): Promise<void> {
      const duration = startTime ? Date.now() - startTime : undefined;
      await trackCompletion({
        tool: params.tool,
        variant,
        sessionId: params.sessionId,
        duration,
        steps,
      });
    },

    /**
     * Track an error
     * Call this when the tool execution fails
     */
    async error(errorType: string, errorMessage?: string): Promise<void> {
      await trackError({
        tool: params.tool,
        variant,
        sessionId: params.sessionId,
        errorType,
        errorMessage,
      });
    },

    /**
     * Track a conversion event
     * Call this for specific success metrics
     */
    async convert(conversionType: string, value?: number): Promise<void> {
      await trackConversion({
        tool: params.tool,
        variant,
        sessionId: params.sessionId,
        conversionType,
        value,
      });
    },
  };
}
