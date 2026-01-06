import { z } from 'zod';
import {
  idSchema,
  visualElementTypeSchema,
  visualOperationTypeSchema,
  visualTransformationTypeSchema,
  diagramTypeSchema,
  positiveNumberSchema,
  optionalStringArraySchema
} from './common.js';

// ============================================================================
// VisualElement Schema (map tool)
// ============================================================================

/**
 * Zod schema for validating VisualElement
 * Matches the VisualElement interface from src/models/interfaces.ts
 */
export const visualElementSchema = z.object({
  // Required fields
  id: idSchema.describe('Unique identifier for this visual element'),
  type: visualElementTypeSchema.describe('Type of visual element (node, edge, container, annotation)'),
  properties: z.record(z.any()).describe('Properties dictionary for the element'),

  // Optional fields
  label: z.string().optional().describe('Optional label for the element'),
  source: z.string().optional().describe('Optional source node ID (for edges)'),
  target: z.string().optional().describe('Optional target node ID (for edges)'),
  contains: optionalStringArraySchema.describe('Optional array of contained element IDs (for containers)')
});

export type VisualElement = z.infer<typeof visualElementSchema>;

// ============================================================================
// VisualOperationData Schema (map tool)
// ============================================================================

/**
 * Zod schema for validating VisualOperationData
 * Matches the VisualOperationData interface from src/models/interfaces.ts
 */
export const visualOperationDataSchema = z.object({
  // Required fields
  operation: visualOperationTypeSchema.describe('Type of operation (create, update, delete, transform, observe)'),
  diagramId: idSchema.describe('Unique identifier for this diagram'),
  diagramType: diagramTypeSchema.describe('Type of diagram (graph, flowchart, stateDiagram, conceptMap, treeDiagram, custom)'),
  iteration: positiveNumberSchema.int().describe('Current iteration number'),
  nextOperationNeeded: z.boolean().describe('Whether another operation is needed'),

  // Optional fields
  elements: z.array(visualElementSchema).optional().describe('Optional array of visual elements'),
  transformationType: visualTransformationTypeSchema.optional().describe('Optional type of transformation (rotate, move, resize, recolor, regroup)'),
  observation: z.string().optional().describe('Optional observation about the diagram'),
  insight: z.string().optional().describe('Optional insight gained from the diagram'),
  hypothesis: z.string().optional().describe('Optional hypothesis derived from the diagram')
});

export type VisualOperationData = z.infer<typeof visualOperationDataSchema>;
