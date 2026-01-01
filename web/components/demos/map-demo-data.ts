// Map Demo Data - Customer Journey Touchpoints Scenario
// Aligned with MCP Map Tool JSON schema

export type DiagramType = 'graph' | 'flowchart' | 'stateDiagram' | 'conceptMap' | 'treeDiagram' | 'custom';
export type OperationType = 'create' | 'update' | 'delete' | 'transform' | 'observe';
export type TransformType = 'rotate' | 'move' | 'resize' | 'recolor' | 'regroup';
export type ElementType = 'node' | 'edge' | 'container' | 'annotation';

export interface MapElement {
  id: string;
  type: ElementType;
  label?: string;
  properties: Record<string, unknown>;
  source?: string;  // for edges
  target?: string;  // for edges
  contains?: string[];  // for containers
}

export interface MapDemoStep {
  operation: OperationType;
  diagramId: string;
  diagramType: DiagramType;
  iteration: number;
  nextOperationNeeded: boolean;
  status: 'success' | 'error';

  // Element counts
  elementCount: number;
  nodeCount: number;
  edgeCount: number;
  containerCount: number;
  annotationCount: number;

  // Elements array
  elements: MapElement[];

  // Optional fields
  transformationType?: TransformType;
  observation?: string;
  insight?: string;
  hypothesis?: string;
}

// Customer Journey Mapping - 4-Step Demo Scenario
export const mapDemoSteps: MapDemoStep[] = [
  // Step 1: CREATE - Initial journey map
  {
    operation: 'create',
    diagramId: 'customer-journey-001',
    diagramType: 'flowchart',
    iteration: 0,
    nextOperationNeeded: true,
    status: 'success',
    elementCount: 9,
    nodeCount: 5,
    edgeCount: 4,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'awareness',
        type: 'node',
        label: 'Awareness',
        properties: { stage: 'top-funnel', x: 10, y: 30, icon: 'megaphone' }
      },
      {
        id: 'consideration',
        type: 'node',
        label: 'Consideration',
        properties: { stage: 'mid-funnel', x: 30, y: 30, icon: 'search' }
      },
      {
        id: 'decision',
        type: 'node',
        label: 'Decision',
        properties: { stage: 'mid-funnel', x: 50, y: 30, icon: 'scale' }
      },
      {
        id: 'purchase',
        type: 'node',
        label: 'Purchase',
        properties: { stage: 'bottom-funnel', x: 70, y: 30, icon: 'cart' }
      },
      {
        id: 'retention',
        type: 'node',
        label: 'Retention',
        properties: { stage: 'post-purchase', x: 90, y: 30, icon: 'heart' }
      },
      {
        id: 'edge-1',
        type: 'edge',
        source: 'awareness',
        target: 'consideration',
        properties: { conversion: '35%' }
      },
      {
        id: 'edge-2',
        type: 'edge',
        source: 'consideration',
        target: 'decision',
        properties: { conversion: '50%' }
      },
      {
        id: 'edge-3',
        type: 'edge',
        source: 'decision',
        target: 'purchase',
        properties: { conversion: '25%' }
      },
      {
        id: 'edge-4',
        type: 'edge',
        source: 'purchase',
        target: 'retention',
        properties: { conversion: '80%' }
      }
    ]
  },

  // Step 2: OBSERVE - Analyze the diagram
  {
    operation: 'observe',
    diagramId: 'customer-journey-001',
    diagramType: 'flowchart',
    iteration: 1,
    nextOperationNeeded: true,
    status: 'success',
    elementCount: 9,
    nodeCount: 5,
    edgeCount: 4,
    containerCount: 0,
    annotationCount: 0,
    elements: [], // No new elements in observe
    observation: 'The awareness to consideration conversion at 35% seems low compared to industry benchmarks of 45-50%. The decision to purchase funnel also shows significant drop-off at 25%.',
    insight: 'Two critical friction points identified: top-of-funnel acquisition and bottom-of-funnel conversion. Current journey lacks re-engagement loops for churned prospects.',
    hypothesis: 'Adding a referral channel for higher-quality leads and implementing a nurture sequence for decision-stage prospects could improve overall conversion by 20%.'
  },

  // Step 3: UPDATE - Add new elements based on insights
  {
    operation: 'update',
    diagramId: 'customer-journey-001',
    diagramType: 'flowchart',
    iteration: 2,
    nextOperationNeeded: true,
    status: 'success',
    elementCount: 13,
    nodeCount: 7,
    edgeCount: 5,
    containerCount: 0,
    annotationCount: 1,
    elements: [
      // Existing elements
      {
        id: 'awareness',
        type: 'node',
        label: 'Awareness',
        properties: { stage: 'top-funnel', x: 15, y: 25, icon: 'megaphone' }
      },
      {
        id: 'referral',
        type: 'node',
        label: 'Referral',
        properties: { stage: 'top-funnel', x: 15, y: 55, icon: 'users', isNew: true }
      },
      {
        id: 'consideration',
        type: 'node',
        label: 'Consideration',
        properties: { stage: 'mid-funnel', x: 35, y: 40, icon: 'search' }
      },
      {
        id: 'decision',
        type: 'node',
        label: 'Decision',
        properties: { stage: 'mid-funnel', x: 55, y: 40, icon: 'scale' }
      },
      {
        id: 'nurture',
        type: 'node',
        label: 'Nurture Loop',
        properties: { stage: 'mid-funnel', x: 55, y: 65, icon: 'refresh', isNew: true }
      },
      {
        id: 'purchase',
        type: 'node',
        label: 'Purchase',
        properties: { stage: 'bottom-funnel', x: 75, y: 40, icon: 'cart' }
      },
      {
        id: 'retention',
        type: 'node',
        label: 'Retention',
        properties: { stage: 'post-purchase', x: 90, y: 40, icon: 'heart' }
      },
      // Edges
      {
        id: 'edge-1',
        type: 'edge',
        source: 'awareness',
        target: 'consideration',
        properties: { conversion: '35%' }
      },
      {
        id: 'edge-ref',
        type: 'edge',
        source: 'referral',
        target: 'consideration',
        properties: { conversion: '55%', isNew: true }
      },
      {
        id: 'edge-2',
        type: 'edge',
        source: 'consideration',
        target: 'decision',
        properties: { conversion: '50%' }
      },
      {
        id: 'edge-3',
        type: 'edge',
        source: 'decision',
        target: 'purchase',
        properties: { conversion: '25%' }
      },
      {
        id: 'edge-nurture',
        type: 'edge',
        source: 'nurture',
        target: 'decision',
        properties: { conversion: '40%', isNew: true }
      },
      // Annotation
      {
        id: 'friction-annotation',
        type: 'annotation',
        label: 'Critical Friction Point',
        properties: { x: 55, y: 52, color: 'warning' }
      }
    ],
    observation: 'Added referral channel and nurture loop based on previous insights.'
  },

  // Step 4: TRANSFORM - Group into strategic phases
  {
    operation: 'transform',
    diagramId: 'customer-journey-001',
    diagramType: 'flowchart',
    iteration: 3,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 15,
    nodeCount: 7,
    edgeCount: 5,
    containerCount: 2,
    annotationCount: 1,
    transformationType: 'regroup',
    elements: [
      // Containers for phase grouping
      {
        id: 'acquisition-phase',
        type: 'container',
        label: 'Acquisition Phase',
        properties: { color: 'blue', x: 5, y: 15, width: 30, height: 55 },
        contains: ['awareness', 'referral']
      },
      {
        id: 'conversion-phase',
        type: 'container',
        label: 'Conversion Phase',
        properties: { color: 'green', x: 40, y: 20, width: 45, height: 60 },
        contains: ['consideration', 'decision', 'nurture', 'purchase']
      },
      // Nodes
      {
        id: 'awareness',
        type: 'node',
        label: 'Awareness',
        properties: { stage: 'top-funnel', x: 15, y: 25, icon: 'megaphone' }
      },
      {
        id: 'referral',
        type: 'node',
        label: 'Referral',
        properties: { stage: 'top-funnel', x: 15, y: 55, icon: 'users' }
      },
      {
        id: 'consideration',
        type: 'node',
        label: 'Consideration',
        properties: { stage: 'mid-funnel', x: 45, y: 35, icon: 'search' }
      },
      {
        id: 'decision',
        type: 'node',
        label: 'Decision',
        properties: { stage: 'mid-funnel', x: 60, y: 35, icon: 'scale' }
      },
      {
        id: 'nurture',
        type: 'node',
        label: 'Nurture Loop',
        properties: { stage: 'mid-funnel', x: 55, y: 60, icon: 'refresh' }
      },
      {
        id: 'purchase',
        type: 'node',
        label: 'Purchase',
        properties: { stage: 'bottom-funnel', x: 75, y: 35, icon: 'cart' }
      },
      {
        id: 'retention',
        type: 'node',
        label: 'Retention',
        properties: { stage: 'post-purchase', x: 90, y: 35, icon: 'heart' }
      },
      // Edges
      {
        id: 'edge-1',
        type: 'edge',
        source: 'awareness',
        target: 'consideration',
        properties: { conversion: '35%' }
      },
      {
        id: 'edge-ref',
        type: 'edge',
        source: 'referral',
        target: 'consideration',
        properties: { conversion: '55%' }
      },
      {
        id: 'edge-2',
        type: 'edge',
        source: 'consideration',
        target: 'decision',
        properties: { conversion: '50%' }
      },
      {
        id: 'edge-3',
        type: 'edge',
        source: 'decision',
        target: 'purchase',
        properties: { conversion: '25%' }
      },
      {
        id: 'edge-nurture',
        type: 'edge',
        source: 'nurture',
        target: 'decision',
        properties: { conversion: '40%' }
      },
      // Annotation
      {
        id: 'friction-annotation',
        type: 'annotation',
        label: 'Critical Friction Point',
        properties: { x: 60, y: 48, color: 'warning' }
      }
    ],
    observation: 'Grouped journey stages into strategic phases for executive presentation.',
    insight: 'Visual grouping clearly shows that Conversion Phase needs the most investment - both in addressing friction and implementing the nurture loop.'
  }
];

// Helper to get current cumulative elements at any step
export function getCumulativeElements(stepIndex: number): MapElement[] {
  const step = mapDemoSteps[stepIndex];
  return step.elements;
}

// Operation display names
export const operationLabels: Record<OperationType, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  transform: 'Transform',
  observe: 'Observe'
};

// Diagram type display names
export const diagramTypeLabels: Record<DiagramType, string> = {
  graph: 'Graph',
  flowchart: 'Flowchart',
  stateDiagram: 'State Diagram',
  conceptMap: 'Concept Map',
  treeDiagram: 'Tree Diagram',
  custom: 'Custom'
};

// Transform type display names
export const transformTypeLabels: Record<TransformType, string> = {
  rotate: 'Rotate',
  move: 'Move',
  resize: 'Resize',
  recolor: 'Recolor',
  regroup: 'Regroup'
};
