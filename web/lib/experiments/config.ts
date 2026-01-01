/**
 * Edge Config Integration for A/B Testing
 *
 * Provides runtime experiment configuration via Vercel Edge Config
 * with graceful fallback to default config when unavailable.
 */

import { get } from '@vercel/edge-config';
import {
  ExperimentConfig,
  DEFAULT_EXPERIMENT_CONFIG,
  PromptVariant,
  ProgressGranularity,
  ResourceDisclosure,
} from './types';

// Cache the config in memory to reduce Edge Config reads
let cachedConfig: ExperimentConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Get the current experiment configuration
 *
 * Fetches from Vercel Edge Config with:
 * - In-memory caching (1 minute TTL)
 * - Graceful fallback to defaults
 * - Partial config merging for incomplete Edge Config responses
 */
export async function getExperimentConfig(): Promise<ExperimentConfig> {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    // Fetch from Edge Config
    const edgeConfig = await get<Partial<ExperimentConfig>>('experimentConfig');

    if (edgeConfig) {
      // Merge with defaults to handle partial configs
      cachedConfig = mergeConfig(edgeConfig);
      cacheTimestamp = now;
      return cachedConfig;
    }
  } catch (error) {
    // Log error but don't throw - graceful degradation
    console.warn('[experiment] Edge Config unavailable, using defaults:', error);
  }

  // Fallback to defaults
  cachedConfig = { ...DEFAULT_EXPERIMENT_CONFIG };
  cacheTimestamp = now;
  return cachedConfig;
}

/**
 * Merge partial Edge Config with defaults
 *
 * Handles cases where Edge Config has only some fields set
 */
function mergeConfig(partial: Partial<ExperimentConfig>): ExperimentConfig {
  return {
    promptVariant: validatePromptVariant(partial.promptVariant),
    progressGranularity: validateProgressGranularity(partial.progressGranularity),
    resourceDisclosure: validateResourceDisclosure(partial.resourceDisclosure),
    features: {
      ...DEFAULT_EXPERIMENT_CONFIG.features,
      ...(partial.features || {}),
    },
    version: partial.version || DEFAULT_EXPERIMENT_CONFIG.version,
  };
}

/**
 * Validate prompt variant, falling back to default if invalid
 */
function validatePromptVariant(value: unknown): PromptVariant {
  if (value === 'A' || value === 'B') {
    return value;
  }
  return DEFAULT_EXPERIMENT_CONFIG.promptVariant;
}

/**
 * Validate progress granularity, falling back to default if invalid
 */
function validateProgressGranularity(value: unknown): ProgressGranularity {
  if (value === 'none' || value === 'phase' || value === 'detailed') {
    return value;
  }
  return DEFAULT_EXPERIMENT_CONFIG.progressGranularity;
}

/**
 * Validate resource disclosure, falling back to default if invalid
 */
function validateResourceDisclosure(value: unknown): ResourceDisclosure {
  if (value === 'minimal' || value === 'standard' || value === 'extended') {
    return value;
  }
  return DEFAULT_EXPERIMENT_CONFIG.resourceDisclosure;
}

/**
 * Force refresh the config cache
 *
 * Useful for testing or when you know the config has changed
 */
export function invalidateConfigCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(
  feature: keyof ExperimentConfig['features']
): Promise<boolean> {
  const config = await getExperimentConfig();
  return config.features[feature];
}
