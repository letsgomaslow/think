/**
 * MCP Prompts Registration
 *
 * Registers all think-mcp prompts with the MCP server.
 * Supports A/B variant switching via experiment configuration.
 */

import { z } from 'zod';
import { analyzeProblePrompt } from './analyze-problem';
import { debugIssuePrompt } from './debug-issue';
import { designDecisionPrompt } from './design-decision';
import { reviewArchitecturePrompt } from './review-architecture';
import { PromptDefinition, buildPromptMessages } from './types';
import { getExperimentConfig } from '../experiments/config';

/**
 * All available prompts
 */
const PROMPTS: Record<string, PromptDefinition> = {
  'analyze-problem': analyzeProblePrompt,
  'debug-issue': debugIssuePrompt,
  'design-decision': designDecisionPrompt,
  'review-architecture': reviewArchitecturePrompt,
};

/**
 * Build argument schema object from prompt arguments
 * Uses plain object format matching how tools define schemas
 */
function buildArgumentSchema(
  args: PromptDefinition['arguments']
): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const arg of args) {
    const schema = z.string().describe(arg.description);
    shape[arg.name] = arg.required ? schema : schema.optional();
  }

  return shape;
}

/**
 * Get prompt list for prompts/list request
 */
export function getPromptList() {
  return Object.values(PROMPTS).map((prompt) => ({
    name: prompt.name,
    description: prompt.description,
    arguments: prompt.arguments,
  }));
}

/**
 * Get a specific prompt with variant-appropriate content
 */
export async function getPrompt(name: string, args: Record<string, string>) {
  const prompt = PROMPTS[name];
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  // Get current experiment config for variant
  const config = await getExperimentConfig();
  const variant = config.promptVariant;

  return buildPromptMessages(prompt, variant, args);
}

/**
 * Register all prompts with the MCP server
 *
 * @param server - The MCP server instance
 */
export function registerAllPrompts(server: any) {
  // Register each prompt with Zod schema
  for (const prompt of Object.values(PROMPTS)) {
    const argumentSchema = buildArgumentSchema(prompt.arguments);

    server.prompt(
      prompt.name,
      prompt.description,
      argumentSchema,
      async (args: Record<string, string>) => {
        return getPrompt(prompt.name, args);
      }
    );
  }
}

// Export for testing/direct access
export { PROMPTS };
