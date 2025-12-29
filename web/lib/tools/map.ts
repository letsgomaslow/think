import { z } from 'zod';

const elementSchema = z.object({
  id: z.string(),
  type: z.enum(['node', 'edge', 'container', 'annotation']),
  label: z.string().optional(),
  properties: z.record(z.unknown()),
  source: z.string().optional(),
  target: z.string().optional(),
  contains: z.array(z.string()).optional(),
});

export const mapSchema = {
  operation: z.enum(['create', 'update', 'delete', 'transform', 'observe']),
  elements: z.array(elementSchema).optional(),
  transformationType: z.enum(['rotate', 'move', 'resize', 'recolor', 'regroup']).optional(),
  diagramId: z.string(),
  diagramType: z.enum([
    'graph',
    'flowchart',
    'stateDiagram',
    'conceptMap',
    'treeDiagram',
    'custom',
  ]),
  iteration: z.number().min(0),
  observation: z.string().optional(),
  insight: z.string().optional(),
  hypothesis: z.string().optional(),
  nextOperationNeeded: z.boolean(),
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
    nextOperationNeeded,
  } = args;

  // Count element types
  const nodeCount = elements.filter(e => e.type === 'node').length;
  const edgeCount = elements.filter(e => e.type === 'edge').length;
  const containerCount = elements.filter(e => e.type === 'container').length;
  const annotationCount = elements.filter(e => e.type === 'annotation').length;

  return {
    operation,
    diagramId,
    diagramType,
    iteration,
    nextOperationNeeded,
    elementCount: elements.length,
    nodeCount,
    edgeCount,
    containerCount,
    annotationCount,
    transformationType: transformationType || null,
    hasObservation: !!observation,
    hasInsight: !!insight,
    hasHypothesis: !!hypothesis,
    status: 'success',
  };
}
