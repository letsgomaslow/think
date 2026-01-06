import { z } from 'zod';

/**
 * Valid element types in visual diagrams
 */
export const elementTypeEnum = z.enum([
  'node',
  'edge',
  'container',
  'annotation',
]);

/**
 * Valid diagram types for visual reasoning
 */
export const diagramTypeEnum = z.enum([
  'graph',
  'flowchart',
  'stateDiagram',
  'conceptMap',
  'treeDiagram',
  'custom',
  'sequenceDiagram',
  'stateMachine',
  'erDiagram',
  'mindMap',
  'contextDiagram',
]);

/**
 * Valid operations on diagrams
 */
export const operationTypeEnum = z.enum([
  'create',
  'update',
  'delete',
  'transform',
  'observe',
]);

/**
 * Valid transformation types for diagram elements
 */
export const transformationTypeEnum = z.enum([
  'rotate',
  'move',
  'resize',
  'recolor',
  'regroup',
]);

/**
 * Schema for a diagram element
 */
const elementSchema = z.object({
  id: z.string()
    .min(1, 'Element ID cannot be empty')
    .describe('Unique identifier for this element'),
  type: elementTypeEnum
    .describe('Element type: node (vertex), edge (connection), container (grouping), annotation (note)'),
  label: z.string()
    .min(1, 'Label cannot be empty')
    .optional()
    .describe('Display label for the element'),
  properties: z.record(z.unknown())
    .describe('Custom properties for this element (e.g., color, size, shape)'),
  source: z.string()
    .min(1, 'Source ID cannot be empty')
    .optional()
    .describe('Source node ID (required for edges)'),
  target: z.string()
    .min(1, 'Target ID cannot be empty')
    .optional()
    .describe('Target node ID (required for edges)'),
  contains: z.array(
    z.string().min(1, 'Contained element ID cannot be empty')
  )
    .optional()
    .describe('IDs of elements contained within this container'),
});

export const mapSchema = {
  operation: operationTypeEnum
    .describe('Operation to perform: create (new diagram/elements), update (modify existing), delete (remove elements), transform (apply transformation), observe (analyze without changes)'),
  elements: z.array(elementSchema)
    .optional()
    .describe('Elements to create, update, or delete'),
  transformationType: transformationTypeEnum
    .optional()
    .describe('Type of transformation: rotate (angular), move (positional), resize (scale), recolor (visual), regroup (organizational)'),
  diagramId: z.string()
    .min(1, 'Diagram ID cannot be empty')
    .describe('Unique identifier for this diagram'),
  diagramType: diagramTypeEnum
    .describe('Diagram type: graph (network), flowchart (process), stateDiagram (states), conceptMap (ideas), treeDiagram (hierarchy), custom (user-defined)'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Current iteration of the visual reasoning process'),
  observation: z.string()
    .min(1, 'Observation cannot be empty')
    .optional()
    .describe('Observations about the current diagram state'),
  insight: z.string()
    .min(1, 'Insight cannot be empty')
    .optional()
    .describe('Insights derived from visual analysis'),
  hypothesis: z.string()
    .min(1, 'Hypothesis cannot be empty')
    .optional()
    .describe('Hypothesis generated from visual patterns'),
  mermaidOutput: z.string()
    .min(1, 'Mermaid output cannot be empty')
    .optional()
    .describe('Mermaid diagram syntax for rendering the visual diagram'),
  nextOperationNeeded: z.boolean()
    .describe('Whether another operation is needed on the diagram'),
};

interface MapInput {
  operation: string;
  elements?: Array<{
    id: string;
    type: string;
    label?: string;
    properties: Record<string, unknown>;
    source?: string;
    target?: string;
    contains?: string[];
  }>;
  transformationType?: string;
  diagramId: string;
  diagramType: string;
  iteration: number;
  observation?: string;
  insight?: string;
  hypothesis?: string;
  mermaidOutput?: string;
  nextOperationNeeded: boolean;
}

export async function handleMap(args: MapInput) {
  const {
    operation,
    elements = [],
    transformationType = '',
    diagramId,
    diagramType,
    iteration,
    observation = '',
    insight = '',
    hypothesis = '',
    mermaidOutput = '',
    nextOperationNeeded,
  } = args;

  // Count element types
  const nodeCount = elements.filter(e => e.type === 'node').length;
  const edgeCount = elements.filter(e => e.type === 'edge').length;
  const containerCount = elements.filter(e => e.type === 'container').length;
  const annotationCount = elements.filter(e => e.type === 'annotation').length;

  return {
    // Core operation state
    operation,
    diagramId,
    diagramType,
    iteration,
    nextOperationNeeded,
    status: 'success',

    // Element counts
    elementCount: elements.length,
    nodeCount,
    edgeCount,
    containerCount,
    annotationCount,

    // Elements array (for diagram reconstruction)
    elements: elements.length > 0 ? elements : undefined,

    // Mermaid diagram output (for visualization)
    mermaidOutput: mermaidOutput || undefined,

    // Transform type (when applicable)
    ...(transformationType && { transformationType }),

    // Cognitive outputs (echo back full strings when provided)
    ...(observation && { observation }),
    ...(insight && { insight }),
    ...(hypothesis && { hypothesis }),
  };
}
