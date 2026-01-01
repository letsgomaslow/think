/**
 * Progress Notification Sender
 *
 * Utilities for emitting progress notifications during tool execution.
 * Supports A/B variant switching for granularity levels.
 */

import {
  ProgressNotification,
  ProgressConfig,
  ProgressGranularity,
  DEFAULT_PROGRESS_CONFIG,
  CouncilPhase,
  HypothesisPhase,
  COUNCIL_PHASES,
  HYPOTHESIS_PHASES,
} from './types';
import { getExperimentConfig } from '../experiments/config';

/**
 * Progress sender context for a tool execution
 */
export interface ProgressContext {
  tool: string;
  totalSteps: number;
  currentStep: number;
  granularity: ProgressGranularity;
  enabled: boolean;
  notifications: ProgressNotification[];
}

/**
 * Create a progress context for tracking tool execution
 */
export async function createProgressContext(
  tool: string,
  totalSteps: number
): Promise<ProgressContext> {
  const config = await getExperimentConfig();
  const granularity = config.progressGranularity || DEFAULT_PROGRESS_CONFIG.granularity;

  return {
    tool,
    totalSteps,
    currentStep: 0,
    granularity,
    // Disable if features.enableProgress is false OR granularity is 'none'
    enabled: config.features?.enableProgress !== false && granularity !== 'none',
    notifications: [],
  };
}

/**
 * Calculate progress percentage
 */
function calculateProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Emit a progress notification
 *
 * In HTTP/stateless mode, notifications are collected and returned with the response.
 * In streaming mode (future), these would be sent via MCP progress notifications.
 */
export function emitProgress(
  ctx: ProgressContext,
  message: string,
  phase?: string,
  context?: Record<string, unknown>
): ProgressNotification | null {
  if (!ctx.enabled) return null;

  ctx.currentStep++;
  const progress = calculateProgress(ctx.currentStep, ctx.totalSteps);

  // Build notification based on granularity
  // 'none' = no notifications (already handled by enabled check)
  // 'phase' = minimal info (tool + progress only)
  // 'detailed' = full info with phase and context
  const notification: ProgressNotification = {
    tool: ctx.tool,
    progress,
    total: ctx.totalSteps,
    message: ctx.granularity === 'detailed' ? message : `${ctx.tool}: ${progress}%`,
    phase: ctx.granularity === 'detailed' ? phase : undefined,
    context: ctx.granularity === 'detailed' ? context : undefined,
  };

  ctx.notifications.push(notification);

  // Log for observability (appears in Vercel logs)
  console.log(
    JSON.stringify({
      type: 'progress',
      ...notification,
      timestamp: new Date().toISOString(),
    })
  );

  return notification;
}

/**
 * Get all collected progress notifications
 */
export function getProgressNotifications(ctx: ProgressContext): ProgressNotification[] {
  return ctx.notifications;
}

/**
 * Create progress helper for council tool
 */
export async function createCouncilProgress(
  personaCount: number
): Promise<{
  ctx: ProgressContext;
  emitPhase: (phase: CouncilPhase, personaName?: string) => ProgressNotification | null;
  emitContribution: (personaName: string, type: string) => ProgressNotification | null;
  getNotifications: () => ProgressNotification[];
}> {
  // Total steps = phases (6) + expected contributions per phase
  const totalSteps = COUNCIL_PHASES.length + personaCount * 2;
  const ctx = await createProgressContext('council', totalSteps);

  return {
    ctx,
    emitPhase: (phase: CouncilPhase, personaName?: string) => {
      const phaseIndex = COUNCIL_PHASES.indexOf(phase);
      const phaseLabel = phase.replace('-', ' ');

      const message = ctx.granularity === 'detailed' && personaName
        ? `Council entering ${phaseLabel} phase with ${personaName} leading`
        : `Council: ${phaseLabel}`;

      return emitProgress(ctx, message, phase, {
        phaseIndex,
        phaseName: phase,
        activePersona: personaName,
      });
    },
    emitContribution: (personaName: string, type: string) => {
      const message = ctx.granularity === 'detailed'
        ? `${personaName} providing ${type}`
        : `Contribution: ${type}`;

      return emitProgress(ctx, message, 'contribution', {
        persona: personaName,
        contributionType: type,
      });
    },
    getNotifications: () => getProgressNotifications(ctx),
  };
}

/**
 * Create progress helper for hypothesis tool
 */
export async function createHypothesisProgress(): Promise<{
  ctx: ProgressContext;
  emitStage: (stage: HypothesisPhase, detail?: string) => ProgressNotification | null;
  getNotifications: () => ProgressNotification[];
}> {
  const ctx = await createProgressContext('hypothesis', HYPOTHESIS_PHASES.length);

  return {
    ctx,
    emitStage: (stage: HypothesisPhase, detail?: string) => {
      const stageIndex = HYPOTHESIS_PHASES.indexOf(stage);
      const stageLabel = stage.charAt(0).toUpperCase() + stage.slice(1);

      const message = ctx.granularity === 'detailed' && detail
        ? `Scientific method: ${stageLabel} - ${detail}`
        : `Hypothesis: ${stageLabel}`;

      return emitProgress(ctx, message, stage, {
        stageIndex,
        stageName: stage,
        detail,
      });
    },
    getNotifications: () => getProgressNotifications(ctx),
  };
}

/**
 * Create a generic progress helper for any tool
 */
export async function createToolProgress(
  toolName: string,
  phases: string[]
): Promise<{
  ctx: ProgressContext;
  emitPhase: (phase: string, detail?: string) => ProgressNotification | null;
  getNotifications: () => ProgressNotification[];
}> {
  const ctx = await createProgressContext(toolName, phases.length);

  return {
    ctx,
    emitPhase: (phase: string, detail?: string) => {
      const phaseIndex = phases.indexOf(phase);

      const message = ctx.granularity === 'detailed' && detail
        ? `${toolName}: ${phase} - ${detail}`
        : `${toolName}: ${phase}`;

      return emitProgress(ctx, message, phase, {
        phaseIndex,
        phaseName: phase,
        detail,
      });
    },
    getNotifications: () => getProgressNotifications(ctx),
  };
}
