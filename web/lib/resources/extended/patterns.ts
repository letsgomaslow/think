/**
 * Extended Design Patterns Resource
 *
 * Provides detailed views of individual design patterns with examples.
 * Accessed via think://patterns/{pattern_name}
 */

import { ReadResourceResult } from '../types';

/**
 * Extended design pattern definitions with examples
 */
const EXTENDED_PATTERNS: Record<string, ExtendedPattern> = {
  modular_architecture: {
    name: 'modular_architecture',
    title: 'Modular Architecture',
    description: 'Design systems with independent, interchangeable modules for better maintainability and scalability.',
    whenToUse: [
      'Building large-scale applications',
      'Designing microservices',
      'Creating plugin systems',
      'When team parallelization is needed',
    ],
    keyPrinciples: [
      'High cohesion within modules',
      'Low coupling between modules',
      'Well-defined interfaces',
      'Single responsibility per module',
    ],
    example: {
      context: 'E-commerce platform architecture',
      implementation: `Module structure:

/modules
  /auth        # User authentication & authorization
  /catalog     # Product catalog & search
  /cart        # Shopping cart operations
  /checkout    # Payment processing
  /orders      # Order management
  /shipping    # Shipping & tracking

Each module:
- Has its own database schema (or schema namespace)
- Exposes a well-defined API
- Can be developed/deployed independently
- Communicates via events or APIs

Example: Cart module doesn't know about Shipping. When order completes, Cart emits "OrderCompleted" event, Shipping module listens and handles fulfillment.`,
    },
    tradeoffs: {
      benefits: [
        'Independent deployment and scaling',
        'Easier to test in isolation',
        'Teams can work in parallel',
        'Easier to understand individual modules',
      ],
      costs: [
        'More complex infrastructure',
        'Cross-module queries are harder',
        'Distributed transactions are complex',
        'Initial setup overhead',
      ],
    },
    toolParameters: {
      patternName: 'modular_architecture',
      context: 'Your system context',
    },
  },
  api_integration: {
    name: 'api_integration',
    title: 'API Integration Patterns',
    description: 'Best practices for integrating with external APIs including error handling, caching, and resilience.',
    whenToUse: [
      'Consuming third-party APIs',
      'Building service-to-service communication',
      'Creating API gateways',
      'Handling unreliable external services',
    ],
    keyPrinciples: [
      'Expect failure and handle gracefully',
      'Implement retries with exponential backoff',
      'Cache responses where appropriate',
      'Use circuit breakers for failing services',
    ],
    example: {
      context: 'Payment gateway integration',
      implementation: `class PaymentGateway {
  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000
  });

  async processPayment(amount: number): Promise<Result> {
    // Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      return this.fallbackPaymentMethod(amount);
    }

    try {
      const result = await this.retryWithBackoff(
        () => this.gateway.charge(amount),
        { maxRetries: 3, baseDelay: 1000 }
      );
      this.circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      return this.handlePaymentError(error);
    }
  }
}`,
    },
    tradeoffs: {
      benefits: [
        'Resilient to external failures',
        'Better user experience during outages',
        'Reduced load on external services',
        'Easier debugging with proper logging',
      ],
      costs: [
        'More complex implementation',
        'Cache invalidation challenges',
        'Potential for stale data',
        'Additional infrastructure for circuit breakers',
      ],
    },
    toolParameters: {
      patternName: 'api_integration',
      context: 'Your API integration scenario',
    },
  },
  state_management: {
    name: 'state_management',
    title: 'State Management',
    description: 'Patterns for managing application state predictably across components and services.',
    whenToUse: [
      'Building complex UI applications',
      'Managing distributed system state',
      'Handling real-time data sync',
      'When state becomes hard to track',
    ],
    keyPrinciples: [
      'Single source of truth',
      'State is read-only (immutable updates)',
      'Changes via pure functions/actions',
      'Unidirectional data flow',
    ],
    example: {
      context: 'Shopping cart state management',
      implementation: `// State shape
interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

// Actions
type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; error: string };

// Reducer (pure function)
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
        total: state.total + action.item.price
      };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    // ... other cases
  }
}

// Usage: dispatch({ type: 'ADD_ITEM', item: product })`,
    },
    tradeoffs: {
      benefits: [
        'Predictable state transitions',
        'Easy to debug (state history)',
        'Testable reducers',
        'Works well with time-travel debugging',
      ],
      costs: [
        'Verbose boilerplate',
        'Learning curve',
        'Overkill for simple apps',
        'Performance considerations with large state',
      ],
    },
    toolParameters: {
      patternName: 'state_management',
      context: 'Your application state scenario',
    },
  },
  async_processing: {
    name: 'async_processing',
    title: 'Asynchronous Processing',
    description: 'Handle long-running operations, background jobs, and concurrent tasks effectively.',
    whenToUse: [
      'Processing large datasets',
      'Handling file uploads/processing',
      'Sending emails or notifications',
      'Any operation that blocks user flow',
    ],
    keyPrinciples: [
      'Acknowledge quickly, process later',
      'Idempotent operations (safe to retry)',
      'Dead letter queues for failures',
      'Progress tracking for long operations',
    ],
    example: {
      context: 'Video processing pipeline',
      implementation: `// 1. User uploads video - immediate acknowledgment
app.post('/upload', async (req, res) => {
  const jobId = uuid();
  await saveUploadMetadata(jobId, req.file);
  await queue.add('process-video', { jobId });
  res.json({ jobId, status: 'processing' });
});

// 2. Background worker processes video
queue.process('process-video', async (job) => {
  const { jobId } = job.data;

  await updateStatus(jobId, 'transcoding');
  await transcodeVideo(jobId);

  await updateStatus(jobId, 'generating-thumbnails');
  await generateThumbnails(jobId);

  await updateStatus(jobId, 'complete');
  await notifyUser(jobId);
});

// 3. Client polls for status
app.get('/status/:jobId', async (req, res) => {
  const status = await getJobStatus(req.params.jobId);
  res.json(status);
});`,
    },
    tradeoffs: {
      benefits: [
        'Responsive user experience',
        'Scalable processing',
        'Resilient to failures',
        'Can prioritize and throttle work',
      ],
      costs: [
        'Infrastructure complexity (queues)',
        'Eventual consistency',
        'Harder to debug',
        'Need status tracking UI',
      ],
    },
    toolParameters: {
      patternName: 'async_processing',
      context: 'Your background processing need',
    },
  },
  scalability: {
    name: 'scalability',
    title: 'Scalability Considerations',
    description: 'Design systems that can handle growth in users, data, and traffic.',
    whenToUse: [
      'Expecting significant growth',
      'Handling variable traffic patterns',
      'Dealing with large datasets',
      'When single server is insufficient',
    ],
    keyPrinciples: [
      'Design for horizontal scaling',
      'Stateless services where possible',
      'Cache aggressively',
      'Partition data appropriately',
    ],
    example: {
      context: 'Scaling a social media feed',
      implementation: `Scaling evolution:

1. Single server (0-10K users)
   - Monolith, single DB

2. Vertical scaling (10K-100K users)
   - Bigger server, read replicas
   - Add Redis cache for sessions

3. Horizontal scaling (100K-1M users)
   - Load balancer + multiple app servers
   - Database sharding by user_id
   - CDN for static assets
   - Feed pre-generation (fan-out on write)

4. Global scale (1M+ users)
   - Multi-region deployment
   - Eventually consistent feed
   - Separate write/read paths (CQRS)
   - Real-time via WebSocket clusters

Key insight: Each scale requires architectural changes. Design for the next order of magnitude, not the current one.`,
    },
    tradeoffs: {
      benefits: [
        'Handle growth without rewriting',
        'Better availability',
        'Geographic distribution',
        'Cost efficiency at scale',
      ],
      costs: [
        'Increased complexity',
        'Harder to develop locally',
        'Distributed system challenges',
        'Higher initial investment',
      ],
    },
    toolParameters: {
      patternName: 'scalability',
      context: 'Your scaling requirements',
    },
  },
  security: {
    name: 'security',
    title: 'Security Best Practices',
    description: 'Implement defense-in-depth security measures throughout your application.',
    whenToUse: [
      'Building any production system',
      'Handling user data',
      'Processing payments',
      'Meeting compliance requirements',
    ],
    keyPrinciples: [
      'Defense in depth (multiple layers)',
      'Principle of least privilege',
      'Fail securely',
      'Audit everything',
    ],
    example: {
      context: 'API security implementation',
      implementation: `// Layer 1: Transport - HTTPS only
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));

// Layer 2: Authentication
app.use('/api', verifyJWT);

// Layer 3: Authorization
app.get('/api/users/:id',
  requireRole('admin', 'self'),
  async (req, res) => {
    // User can only access their own data unless admin
    if (req.user.role !== 'admin' &&
        req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // ...
  }
);

// Layer 4: Input validation
app.post('/api/data',
  validate(dataSchema),
  sanitize(['body.content']),
  async (req, res) => { /* ... */ }
);

// Layer 5: Audit logging
app.use(auditLog);

// Layer 6: Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));`,
    },
    tradeoffs: {
      benefits: [
        'Protection against common attacks',
        'Compliance readiness',
        'User trust',
        'Reduced breach impact',
      ],
      costs: [
        'Development overhead',
        'Performance impact',
        'User friction (auth flows)',
        'Ongoing maintenance',
      ],
    },
    toolParameters: {
      patternName: 'security',
      context: 'Your security requirements',
    },
  },
  agentic_design: {
    name: 'agentic_design',
    title: 'Agentic Design Patterns',
    description: 'Design patterns for building AI agents that can reason, plan, and take actions autonomously.',
    whenToUse: [
      'Building AI assistants',
      'Creating autonomous systems',
      'Designing multi-agent workflows',
      'Implementing tool-using AI',
    ],
    keyPrinciples: [
      'Clear goal specification',
      'Bounded action spaces',
      'Human-in-the-loop checkpoints',
      'Transparent reasoning traces',
    ],
    example: {
      context: 'Code review agent design',
      implementation: `Agent: CodeReviewAgent
Goal: Review PR for quality issues

Action Space:
- read_file(path) → file contents
- search_codebase(query) → matching files
- add_comment(file, line, text) → comment added
- request_changes() → review submitted
- approve() → review submitted

Workflow:
1. PLAN: Understand PR scope
   - Read PR description
   - List changed files

2. ANALYZE: Review each file
   - Check for security issues
   - Verify test coverage
   - Review code style

3. SYNTHESIZE: Form recommendation
   - Aggregate issues found
   - Categorize by severity

4. ACT: Submit review
   - Add specific comments
   - Approve or request changes

Guardrails:
- Max 20 comments per PR
- Cannot merge without human approval
- Logs all reasoning for audit`,
    },
    tradeoffs: {
      benefits: [
        'Automation of complex tasks',
        'Consistent application of rules',
        'Scalable review capacity',
        'Learning from feedback',
      ],
      costs: [
        'Unpredictable behavior risks',
        'Need for guardrails',
        'Explanation/debugging complexity',
        'Dependency on AI capabilities',
      ],
    },
    toolParameters: {
      patternName: 'agentic_design',
      context: 'Your agent design requirements',
    },
  },
};

/**
 * Extended pattern type definition
 */
interface ExtendedPattern {
  name: string;
  title: string;
  description: string;
  whenToUse: string[];
  keyPrinciples: string[];
  example: {
    context: string;
    implementation: string;
  };
  tradeoffs: {
    benefits: string[];
    costs: string[];
  };
  toolParameters: {
    patternName: string;
    context: string;
  };
}

/**
 * Get a specific pattern's extended details
 */
export function getExtendedPattern(patternName: string): ExtendedPattern | null {
  return EXTENDED_PATTERNS[patternName] || null;
}

/**
 * Get all available extended pattern names
 */
export function getExtendedPatternNames(): string[] {
  return Object.keys(EXTENDED_PATTERNS);
}

/**
 * Handle resource read for extended patterns
 * URI format: think://patterns/{pattern_name}
 */
export async function handleExtendedPatternRead(uri: URL): Promise<ReadResourceResult> {
  const patternName = uri.pathname.replace(/^\//, '');
  const pattern = getExtendedPattern(patternName);

  if (!pattern) {
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({
            error: 'Pattern not found',
            availablePatterns: getExtendedPatternNames(),
          }, null, 2),
        },
      ],
    };
  }

  return {
    contents: [
      {
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(pattern, null, 2),
      },
    ],
  };
}
