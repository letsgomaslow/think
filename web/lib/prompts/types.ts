/**
 * MCP Prompts Types for think-mcp
 *
 * Defines types for guided workflow prompts with A/B variant support.
 */

import { PromptVariant } from '../experiments/types';

/**
 * Prompt argument definition
 */
export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

/**
 * Prompt definition with variant content
 */
export interface PromptDefinition {
  name: string;
  description: string;
  arguments: PromptArgument[];
  variants: {
    A: PromptContent;  // Detailed with examples
    B: PromptContent;  // Minimal/concise
  };
}

/**
 * Content for a prompt variant
 */
export interface PromptContent {
  template: string;
  systemContext?: string;
  toolGuidance?: string[];
}

/**
 * Result from prompt/get
 */
export interface GetPromptResult {
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text';
      text: string;
    };
  }>;
}

/**
 * Build prompt messages from definition and variant
 */
export function buildPromptMessages(
  definition: PromptDefinition,
  variant: PromptVariant,
  args: Record<string, string>
): GetPromptResult {
  const content = definition.variants[variant];

  // Replace argument placeholders in template
  let text = content.template;
  for (const [key, value] of Object.entries(args)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // Add tool guidance if present
  if (content.toolGuidance && content.toolGuidance.length > 0) {
    text += '\n\n## Recommended Tool Workflow\n';
    content.toolGuidance.forEach((step, index) => {
      text += `${index + 1}. ${step}\n`;
    });
  }

  const messages: GetPromptResult['messages'] = [
    {
      role: 'user',
      content: {
        type: 'text',
        text,
      },
    },
  ];

  // Add system context as assistant preamble if present
  if (content.systemContext) {
    messages.unshift({
      role: 'assistant',
      content: {
        type: 'text',
        text: content.systemContext,
      },
    });
  }

  return { messages };
}
