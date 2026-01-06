// Map Demo Data - Customer Journey Touchpoints Scenario
// Aligned with MCP Map Tool JSON schema

export type DiagramType = 'graph' | 'flowchart' | 'stateDiagram' | 'conceptMap' | 'treeDiagram' | 'custom' | 'sequenceDiagram' | 'stateMachine' | 'erDiagram' | 'mindMap' | 'contextDiagram';
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

// Sequence Diagram Demo - API Request Flow
export const sequenceDiagramDemo: MapDemoStep[] = [
  {
    operation: 'create',
    diagramId: 'api-flow-001',
    diagramType: 'sequenceDiagram',
    iteration: 0,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 11,
    nodeCount: 4,
    edgeCount: 7,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'client',
        type: 'node',
        label: 'Client App',
        properties: {}
      },
      {
        id: 'api',
        type: 'node',
        label: 'API Gateway',
        properties: {}
      },
      {
        id: 'auth',
        type: 'node',
        label: 'Auth Service',
        properties: {}
      },
      {
        id: 'db',
        type: 'node',
        label: 'Database',
        properties: {}
      },
      {
        id: 'msg-1',
        type: 'edge',
        label: 'POST /login',
        source: 'client',
        target: 'api',
        properties: { arrowType: '->>' }
      },
      {
        id: 'msg-2',
        type: 'edge',
        label: 'Validate credentials',
        source: 'api',
        target: 'auth',
        properties: { arrowType: '->>' }
      },
      {
        id: 'msg-3',
        type: 'edge',
        label: 'Query user',
        source: 'auth',
        target: 'db',
        properties: { arrowType: '->>' }
      },
      {
        id: 'msg-4',
        type: 'edge',
        label: 'User data',
        source: 'db',
        target: 'auth',
        properties: { arrowType: '-->>' }
      },
      {
        id: 'msg-5',
        type: 'edge',
        label: 'JWT token',
        source: 'auth',
        target: 'api',
        properties: { arrowType: '-->>' }
      },
      {
        id: 'msg-6',
        type: 'edge',
        label: '200 OK + token',
        source: 'api',
        target: 'client',
        properties: { arrowType: '-->>' }
      },
      {
        id: 'msg-7',
        type: 'edge',
        label: 'Store token',
        source: 'client',
        target: 'client',
        properties: { arrowType: '->>' }
      }
    ]
  }
];

// State Machine Demo - Order Lifecycle
export const stateMachineDemo: MapDemoStep[] = [
  {
    operation: 'create',
    diagramId: 'order-lifecycle-001',
    diagramType: 'stateMachine',
    iteration: 0,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 11,
    nodeCount: 6,
    edgeCount: 5,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'pending',
        type: 'node',
        label: 'Pending Payment',
        properties: { isStart: true }
      },
      {
        id: 'paid',
        type: 'node',
        label: 'Payment Confirmed',
        properties: {}
      },
      {
        id: 'processing',
        type: 'node',
        label: 'Processing Order',
        properties: {}
      },
      {
        id: 'shipped',
        type: 'node',
        label: 'Shipped',
        properties: {}
      },
      {
        id: 'delivered',
        type: 'node',
        label: 'Delivered',
        properties: { isEnd: true }
      },
      {
        id: 'cancelled',
        type: 'node',
        label: 'Cancelled',
        properties: { isEnd: true }
      },
      {
        id: 'trans-1',
        type: 'edge',
        label: 'payment received',
        source: 'pending',
        target: 'paid',
        properties: {}
      },
      {
        id: 'trans-2',
        type: 'edge',
        label: 'start fulfillment',
        source: 'paid',
        target: 'processing',
        properties: {}
      },
      {
        id: 'trans-3',
        type: 'edge',
        label: 'dispatch',
        source: 'processing',
        target: 'shipped',
        properties: {}
      },
      {
        id: 'trans-4',
        type: 'edge',
        label: 'customer confirmation',
        source: 'shipped',
        target: 'delivered',
        properties: {}
      },
      {
        id: 'trans-5',
        type: 'edge',
        label: 'cancel request',
        source: 'pending',
        target: 'cancelled',
        properties: {}
      }
    ]
  }
];

// ER Diagram Demo - User Database Schema
export const erDiagramDemo: MapDemoStep[] = [
  {
    operation: 'create',
    diagramId: 'user-schema-001',
    diagramType: 'erDiagram',
    iteration: 0,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 6,
    nodeCount: 3,
    edgeCount: 3,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'User',
        type: 'node',
        label: 'User',
        properties: {
          attributes: [
            { name: 'id', type: 'int', key: true },
            { name: 'email', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'created_at', type: 'timestamp' }
          ]
        }
      },
      {
        id: 'Order',
        type: 'node',
        label: 'Order',
        properties: {
          attributes: [
            { name: 'id', type: 'int', key: true },
            { name: 'user_id', type: 'int' },
            { name: 'total', type: 'decimal' },
            { name: 'status', type: 'string' },
            { name: 'created_at', type: 'timestamp' }
          ]
        }
      },
      {
        id: 'Product',
        type: 'node',
        label: 'Product',
        properties: {
          attributes: [
            { name: 'id', type: 'int', key: true },
            { name: 'name', type: 'string' },
            { name: 'price', type: 'decimal' },
            { name: 'stock', type: 'int' }
          ]
        }
      },
      {
        id: 'rel-1',
        type: 'edge',
        label: 'places',
        source: 'User',
        target: 'Order',
        properties: { cardinality: '||--o{' }
      },
      {
        id: 'rel-2',
        type: 'edge',
        label: 'contains',
        source: 'Order',
        target: 'Product',
        properties: { cardinality: '}o--o{' }
      },
      {
        id: 'rel-3',
        type: 'edge',
        label: 'views',
        source: 'User',
        target: 'Product',
        properties: { cardinality: '}o--o{' }
      }
    ]
  }
];

// Mind Map Demo - Feature Brainstorm
export const mindMapDemo: MapDemoStep[] = [
  {
    operation: 'create',
    diagramId: 'feature-brainstorm-001',
    diagramType: 'mindMap',
    iteration: 0,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 11,
    nodeCount: 11,
    edgeCount: 0,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'mobile-app',
        type: 'node',
        label: 'Mobile App v2.0',
        properties: { isRoot: true, shape: 'circle' },
        contains: ['auth', 'social', 'analytics']
      },
      {
        id: 'auth',
        type: 'node',
        label: 'Authentication',
        properties: { shape: 'square' },
        contains: ['biometric', 'sso']
      },
      {
        id: 'biometric',
        type: 'node',
        label: 'Biometric Login',
        properties: {}
      },
      {
        id: 'sso',
        type: 'node',
        label: 'SSO Integration',
        properties: {}
      },
      {
        id: 'social',
        type: 'node',
        label: 'Social Features',
        properties: { shape: 'square' },
        contains: ['sharing', 'friends', 'chat']
      },
      {
        id: 'sharing',
        type: 'node',
        label: 'Content Sharing',
        properties: {}
      },
      {
        id: 'friends',
        type: 'node',
        label: 'Friend Network',
        properties: {}
      },
      {
        id: 'chat',
        type: 'node',
        label: 'Real-time Chat',
        properties: {}
      },
      {
        id: 'analytics',
        type: 'node',
        label: 'Analytics',
        properties: { shape: 'square' },
        contains: ['tracking', 'reports']
      },
      {
        id: 'tracking',
        type: 'node',
        label: 'Event Tracking',
        properties: {}
      },
      {
        id: 'reports',
        type: 'node',
        label: 'User Reports',
        properties: {}
      }
    ]
  }
];

// Context Diagram Demo - System Overview
export const contextDiagramDemo: MapDemoStep[] = [
  {
    operation: 'create',
    diagramId: 'system-context-001',
    diagramType: 'contextDiagram',
    iteration: 0,
    nextOperationNeeded: false,
    status: 'success',
    elementCount: 8,
    nodeCount: 5,
    edgeCount: 3,
    containerCount: 0,
    annotationCount: 0,
    elements: [
      {
        id: 'customer',
        type: 'node',
        label: 'Customer',
        properties: {
          nodeType: 'Person',
          description: 'End user of the e-commerce platform'
        }
      },
      {
        id: 'admin',
        type: 'node',
        label: 'Administrator',
        properties: {
          nodeType: 'Person',
          description: 'System administrator'
        }
      },
      {
        id: 'ecommerce',
        type: 'node',
        label: 'E-Commerce Platform',
        properties: {
          nodeType: 'System',
          description: 'Main application handling orders and inventory'
        }
      },
      {
        id: 'payment',
        type: 'node',
        label: 'Payment Gateway',
        properties: {
          nodeType: 'System_Ext',
          description: 'External payment processing service'
        }
      },
      {
        id: 'email',
        type: 'node',
        label: 'Email Service',
        properties: {
          nodeType: 'System_Ext',
          description: 'Transactional email provider'
        }
      },
      {
        id: 'rel-1',
        type: 'edge',
        label: 'Browse & purchase products',
        source: 'customer',
        target: 'ecommerce',
        properties: { technology: 'HTTPS/REST' }
      },
      {
        id: 'rel-2',
        type: 'edge',
        label: 'Manage catalog',
        source: 'admin',
        target: 'ecommerce',
        properties: { technology: 'HTTPS/REST' }
      },
      {
        id: 'rel-3',
        type: 'edge',
        label: 'Process payments',
        source: 'ecommerce',
        target: 'payment',
        properties: { technology: 'REST API' }
      }
    ]
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
  custom: 'Custom',
  sequenceDiagram: 'Sequence Diagram',
  stateMachine: 'State Machine',
  erDiagram: 'ER Diagram',
  mindMap: 'Mind Map',
  contextDiagram: 'Context Diagram'
};

// Transform type display names
export const transformTypeLabels: Record<TransformType, string> = {
  rotate: 'Rotate',
  move: 'Move',
  resize: 'Resize',
  recolor: 'Recolor',
  regroup: 'Regroup'
};
