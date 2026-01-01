/**
 * Extended Programming Paradigms Resource
 *
 * Provides detailed views of individual programming paradigms with examples.
 * Accessed via think://paradigms/{paradigm_name}
 */

import { ReadResourceResult } from '../types';

/**
 * Extended paradigm definitions with examples
 */
const EXTENDED_PARADIGMS: Record<string, ExtendedParadigm> = {
  imperative: {
    name: 'imperative',
    title: 'Imperative Programming',
    description: 'Execute sequences of commands that change program state step by step.',
    coreConcepts: [
      'Variables and assignment',
      'Sequential execution',
      'Control flow (if/else, loops)',
      'State mutation',
    ],
    bestFor: [
      'Low-level system programming',
      'Performance-critical algorithms',
      'Hardware interaction',
      'Simple scripts',
    ],
    example: {
      language: 'C',
      code: `// Imperative: Find the maximum value in an array
int findMax(int arr[], int size) {
    int max = arr[0];  // Initialize state

    for (int i = 1; i < size; i++) {  // Sequential iteration
        if (arr[i] > max) {  // Control flow
            max = arr[i];  // State mutation
        }
    }

    return max;
}`,
      explanation: 'Each line is a command that modifies state. We track `max` and update it as we find larger values.',
    },
    contrast: {
      versus: 'functional',
      difference: 'Imperative mutates state in place; functional creates new values from transformations.',
    },
    toolParameters: {
      paradigmName: 'imperative',
      problem: 'Your problem statement',
    },
  },
  functional: {
    name: 'functional',
    title: 'Functional Programming',
    description: 'Build programs by composing pure functions without side effects.',
    coreConcepts: [
      'Pure functions (same input → same output)',
      'Immutability',
      'Function composition',
      'Higher-order functions',
    ],
    bestFor: [
      'Data transformation pipelines',
      'Concurrent/parallel processing',
      'Predictable state management',
      'Mathematical computations',
    ],
    example: {
      language: 'JavaScript',
      code: `// Functional: Process user data
const processUsers = (users) =>
  users
    .filter(user => user.active)
    .map(user => ({
      ...user,
      fullName: \`\${user.firstName} \${user.lastName}\`
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

// Pure function: no side effects, same input = same output
// Original users array is unchanged
const activeUsers = processUsers(users);`,
      explanation: 'Each operation returns a new value without mutating the original. Functions are composed in a pipeline.',
    },
    contrast: {
      versus: 'object_oriented',
      difference: 'Functional separates data and functions; OOP bundles them into objects.',
    },
    toolParameters: {
      paradigmName: 'functional',
      problem: 'Your problem statement',
    },
  },
  object_oriented: {
    name: 'object_oriented',
    title: 'Object-Oriented Programming',
    description: 'Model systems using objects that encapsulate state and behavior.',
    coreConcepts: [
      'Encapsulation (hide internal state)',
      'Inheritance (share behavior)',
      'Polymorphism (same interface, different behavior)',
      'Abstraction (model concepts)',
    ],
    bestFor: [
      'Large-scale applications',
      'Domain modeling',
      'GUI frameworks',
      'Simulation systems',
    ],
    example: {
      language: 'TypeScript',
      code: `// Object-Oriented: Payment processing
interface PaymentMethod {
  process(amount: number): Promise<Receipt>;
}

class CreditCard implements PaymentMethod {
  constructor(private cardNumber: string) {}

  async process(amount: number): Promise<Receipt> {
    // Card-specific processing
    return this.chargeCard(amount);
  }

  private chargeCard(amount: number): Receipt { /* ... */ }
}

class PayPal implements PaymentMethod {
  async process(amount: number): Promise<Receipt> {
    // PayPal-specific processing
    return this.initiatePayPalPayment(amount);
  }
}

// Polymorphism: same interface, different behavior
async function checkout(method: PaymentMethod, amount: number) {
  return method.process(amount);
}`,
      explanation: 'Objects encapsulate their implementation details. Code depends on interfaces, not concrete classes.',
    },
    contrast: {
      versus: 'procedural',
      difference: 'OOP bundles data with behavior; procedural keeps them separate.',
    },
    toolParameters: {
      paradigmName: 'object_oriented',
      problem: 'Your problem statement',
    },
  },
  reactive: {
    name: 'reactive',
    title: 'Reactive Programming',
    description: 'Build systems that react to data streams and propagate changes.',
    coreConcepts: [
      'Data streams (Observable)',
      'Operators (map, filter, merge)',
      'Subscriptions',
      'Backpressure handling',
    ],
    bestFor: [
      'Real-time dashboards',
      'Event processing',
      'UI state management',
      'Streaming data',
    ],
    example: {
      language: 'TypeScript (RxJS)',
      code: `// Reactive: Search with debounce and caching
const search$ = fromEvent(searchInput, 'input').pipe(
  map(event => event.target.value),
  debounceTime(300),          // Wait for typing pause
  distinctUntilChanged(),     // Ignore if same query
  switchMap(query =>          // Cancel previous request
    query.length < 3
      ? of([])
      : searchAPI(query).pipe(
          catchError(() => of([]))
        )
  )
);

search$.subscribe(results => {
  renderResults(results);
});`,
      explanation: 'Data flows through a pipeline of operators. The stream reacts to changes and handles async complexity declaratively.',
    },
    contrast: {
      versus: 'imperative',
      difference: 'Reactive declares data flow relationships; imperative manually coordinates callbacks.',
    },
    toolParameters: {
      paradigmName: 'reactive',
      problem: 'Your problem statement',
    },
  },
  event_driven: {
    name: 'event_driven',
    title: 'Event-Driven Programming',
    description: 'Structure programs around events and their handlers.',
    coreConcepts: [
      'Events (things that happen)',
      'Event emitters/dispatchers',
      'Event handlers/listeners',
      'Event queues',
    ],
    bestFor: [
      'User interfaces',
      'Microservices communication',
      'IoT systems',
      'Game development',
    ],
    example: {
      language: 'TypeScript',
      code: `// Event-Driven: Order processing system
class OrderService extends EventEmitter {
  async createOrder(items: Item[]) {
    const order = await db.orders.create({ items });

    // Emit event - other services react
    this.emit('order:created', order);

    return order;
  }
}

// Handlers react to events independently
orderService.on('order:created', async (order) => {
  await inventoryService.reserve(order.items);
});

orderService.on('order:created', async (order) => {
  await emailService.sendConfirmation(order);
});

orderService.on('order:created', async (order) => {
  await analyticsService.track('purchase', order);
});`,
      explanation: 'Components communicate via events. The order service doesn\'t know about inventory, email, or analytics - they react independently.',
    },
    contrast: {
      versus: 'procedural',
      difference: 'Event-driven inverts control flow; procedural calls functions directly.',
    },
    toolParameters: {
      paradigmName: 'event_driven',
      problem: 'Your problem statement',
    },
  },
  declarative: {
    name: 'declarative',
    title: 'Declarative Programming',
    description: 'Describe what the program should accomplish without specifying how.',
    coreConcepts: [
      'Describe desired outcome',
      'Hide implementation details',
      'Express relationships',
      'Let runtime optimize',
    ],
    bestFor: [
      'Database queries',
      'UI definitions',
      'Configuration',
      'Build systems',
    ],
    example: {
      language: 'SQL + React',
      code: `-- Declarative SQL: What data, not how to get it
SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at > '2024-01-01'
GROUP BY users.id
HAVING order_count > 5
ORDER BY order_count DESC;

// Declarative React: What UI, not how to update DOM
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`,
      explanation: 'We describe the result we want. SQL planner and React runtime figure out how to achieve it efficiently.',
    },
    contrast: {
      versus: 'imperative',
      difference: 'Declarative says WHAT you want; imperative says HOW to do it.',
    },
    toolParameters: {
      paradigmName: 'declarative',
      problem: 'Your problem statement',
    },
  },
  concurrent: {
    name: 'concurrent',
    title: 'Concurrent Programming',
    description: 'Execute multiple computations simultaneously for improved throughput.',
    coreConcepts: [
      'Threads/processes',
      'Synchronization primitives',
      'Race condition prevention',
      'Deadlock avoidance',
    ],
    bestFor: [
      'Multi-core utilization',
      'Server request handling',
      'Background processing',
      'Parallel algorithms',
    ],
    example: {
      language: 'Go',
      code: `// Concurrent: Process items in parallel with worker pool
func processItems(items []Item) []Result {
    numWorkers := runtime.NumCPU()
    jobs := make(chan Item, len(items))
    results := make(chan Result, len(items))

    // Start workers
    for i := 0; i < numWorkers; i++ {
        go func() {
            for item := range jobs {
                results <- processItem(item)
            }
        }()
    }

    // Send jobs
    for _, item := range items {
        jobs <- item
    }
    close(jobs)

    // Collect results
    var output []Result
    for i := 0; i < len(items); i++ {
        output = append(output, <-results)
    }
    return output
}`,
      explanation: 'Work is distributed across goroutines. Channels coordinate safely without explicit locks.',
    },
    contrast: {
      versus: 'imperative',
      difference: 'Concurrent runs multiple paths simultaneously; sequential runs one path at a time.',
    },
    toolParameters: {
      paradigmName: 'concurrent',
      problem: 'Your problem statement',
    },
  },
  procedural: {
    name: 'procedural',
    title: 'Procedural Programming',
    description: 'Organize code into reusable procedures that operate on data.',
    coreConcepts: [
      'Procedures/functions',
      'Parameters and return values',
      'Scope and local variables',
      'Structured programming',
    ],
    bestFor: ['Scripts', 'Data processing', 'System utilities', 'Simple programs'],
    example: {
      language: 'Python',
      code: `# Procedural: Data processing pipeline
def read_data(filename):
    with open(filename) as f:
        return json.load(f)

def filter_active(records):
    return [r for r in records if r['active']]

def transform(records):
    return [{'name': r['name'], 'score': r['value'] * 10} for r in records]

def save_results(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, f)

# Main procedure composes smaller procedures
def process_file(input_file, output_file):
    data = read_data(input_file)
    active = filter_active(data)
    transformed = transform(active)
    save_results(transformed, output_file)`,
      explanation: 'Each procedure does one thing. Main logic composes procedures in sequence.',
    },
    contrast: { versus: 'object_oriented', difference: 'Procedural separates data and functions; OOP bundles them.' },
    toolParameters: { paradigmName: 'procedural', problem: 'Your problem statement' },
  },
  logic: {
    name: 'logic',
    title: 'Logic Programming',
    description: 'Express computation as logical relations and queries.',
    coreConcepts: ['Facts and rules', 'Unification', 'Backtracking', 'Goals and queries'],
    bestFor: ['Expert systems', 'Constraint solving', 'Natural language processing', 'Knowledge bases'],
    example: {
      language: 'Prolog',
      code: `% Facts
parent(tom, bob).
parent(bob, ann).
parent(bob, pat).

% Rules
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
sibling(X, Y) :- parent(P, X), parent(P, Y), X \\= Y.

% Query: Who are Tom's grandchildren?
?- grandparent(tom, X).
% X = ann ; X = pat`,
      explanation: 'Define relationships as facts and rules. Query the knowledge base; Prolog finds solutions via backtracking.',
    },
    contrast: { versus: 'imperative', difference: 'Logic declares relationships; imperative specifies steps.' },
    toolParameters: { paradigmName: 'logic', problem: 'Your problem statement' },
  },
  aspect_oriented: {
    name: 'aspect_oriented',
    title: 'Aspect-Oriented Programming',
    description: 'Separate cross-cutting concerns from core business logic.',
    coreConcepts: ['Aspects', 'Pointcuts', 'Advice (before/after/around)', 'Weaving'],
    bestFor: ['Logging', 'Security', 'Transactions', 'Caching'],
    example: {
      language: 'TypeScript (decorators)',
      code: `// Aspect: Logging decorator
function LogExecution(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(\`Calling \${key} with\`, args);
    const result = original.apply(this, args);
    console.log(\`\${key} returned\`, result);
    return result;
  };
}

class UserService {
  @LogExecution  // Aspect applied via decorator
  @Cacheable(60)
  async getUser(id: string): Promise<User> {
    return await db.users.findById(id);
  }
}`,
      explanation: 'Logging and caching are separate concerns. Decorators weave them in without cluttering business logic.',
    },
    contrast: { versus: 'object_oriented', difference: 'AOP extracts cross-cutting concerns; OOP tangles them into classes.' },
    toolParameters: { paradigmName: 'aspect_oriented', problem: 'Your problem statement' },
  },
};

/**
 * Extended paradigm type definition
 */
interface ExtendedParadigm {
  name: string;
  title: string;
  description: string;
  coreConcepts: string[];
  bestFor: string[];
  example: {
    language: string;
    code: string;
    explanation: string;
  };
  contrast: {
    versus: string;
    difference: string;
  };
  toolParameters: {
    paradigmName: string;
    problem: string;
  };
}

/**
 * Get a specific paradigm's extended details
 */
export function getExtendedParadigm(paradigmName: string): ExtendedParadigm | null {
  return EXTENDED_PARADIGMS[paradigmName] || null;
}

/**
 * Get all available extended paradigm names
 */
export function getExtendedParadigmNames(): string[] {
  return Object.keys(EXTENDED_PARADIGMS);
}

/**
 * Handle resource read for extended paradigms
 * URI format: think://paradigms/{paradigm_name}
 */
export async function handleExtendedParadigmRead(uri: URL): Promise<ReadResourceResult> {
  const paradigmName = uri.pathname.replace(/^\//, '');
  const paradigm = getExtendedParadigm(paradigmName);

  if (!paradigm) {
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({
            error: 'Paradigm not found',
            availableParadigms: getExtendedParadigmNames(),
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
        text: JSON.stringify(paradigm, null, 2),
      },
    ],
  };
}
