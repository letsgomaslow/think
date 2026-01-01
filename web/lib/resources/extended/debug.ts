/**
 * Extended Debugging Approaches Resource
 *
 * Provides detailed views of individual debugging approaches with examples.
 * Accessed via think://debug-approaches/{approach_name}
 */

import { ReadResourceResult } from '../types';

/**
 * Extended debugging approach definitions with examples
 */
const EXTENDED_DEBUG_APPROACHES: Record<string, ExtendedDebugApproach> = {
  binary_search: {
    name: 'binary_search',
    title: 'Binary Search Debugging',
    description: 'Narrow down the problem by systematically halving the search space.',
    whenToUse: [
      'Finding which commit introduced a bug',
      'Isolating which component in a chain fails',
      'Narrowing down configuration issues',
      'Finding the breaking change in dependencies',
    ],
    technique: {
      steps: [
        'Define the boundaries (known good state, known bad state)',
        'Test the midpoint',
        'Based on result, eliminate half the search space',
        'Repeat until the problem is isolated',
      ],
      timeComplexity: 'O(log n) - much faster than linear search',
    },
    example: {
      scenario: 'Finding which of 1000 commits broke the build',
      walkthrough: `git bisect start
git bisect bad HEAD           # Current commit is broken
git bisect good v2.0.0        # Version 2.0.0 worked

# Git checks out commit #500
# Run tests... they fail
git bisect bad

# Git checks out commit #250
# Run tests... they pass
git bisect good

# Git checks out commit #375
# Run tests... they fail
git bisect bad

# Git checks out commit #312
# ... continue until found

# After ~10 iterations (log₂ 1000 ≈ 10), found:
# abc123 is the first bad commit

git bisect reset`,
      insight: 'Instead of checking 1000 commits linearly, we found the bug in ~10 steps.',
    },
    commonMistakes: [
      'Not having a reliable test for good/bad',
      'Starting with too narrow a range',
      'Skipping the midpoint test',
    ],
    toolParameters: {
      approachName: 'binary_search',
      issue: 'Your issue description',
    },
  },
  reverse_engineering: {
    name: 'reverse_engineering',
    title: 'Reverse Engineering',
    description: 'Work backwards from observed behavior to understand underlying causes.',
    whenToUse: [
      'Debugging undocumented legacy code',
      'Understanding third-party library behavior',
      'Analyzing production incidents',
      'Learning how a system works by observing it',
    ],
    technique: {
      steps: [
        'Observe and document the behavior precisely',
        'Form hypotheses about internal mechanisms',
        'Design experiments to test each hypothesis',
        'Refine understanding iteratively',
      ],
      keyPrinciple: 'Start from what you CAN observe, infer what you cannot.',
    },
    example: {
      scenario: 'Understanding why an API rate limits at unexpected times',
      walkthrough: `Observation: API returns 429 after ~15 requests, but rate limit docs say 100/min

Hypothesis 1: Maybe there's a per-second limit?
Test: Spread 20 requests over 60 seconds → Still works
Result: Not per-second limiting

Hypothesis 2: Maybe limit is per-endpoint?
Test: Call different endpoints → Some fail at 15, others at 50
Result: Confirmed! Limits vary by endpoint

Hypothesis 3: Maybe it's based on response size?
Test: Large vs small responses → No correlation
Result: Not response-size based

Final understanding:
- /users endpoint: 15/min
- /posts endpoint: 50/min
- /health endpoint: unlimited

Documentation was wrong. Filed a bug with the API provider.`,
      insight: 'Systematic hypothesis testing revealed undocumented endpoint-specific limits.',
    },
    commonMistakes: [
      'Making assumptions instead of testing',
      'Not documenting observations',
      'Testing too many variables at once',
    ],
    toolParameters: {
      approachName: 'reverse_engineering',
      issue: 'Your issue description',
    },
  },
  divide_conquer: {
    name: 'divide_conquer',
    title: 'Divide and Conquer',
    description: 'Break complex problems into smaller, manageable sub-problems.',
    whenToUse: [
      'Debugging complex multi-component systems',
      'Finding which layer in the stack has the bug',
      'Isolating network vs application issues',
      'Integration problems between services',
    ],
    technique: {
      steps: [
        'Map out all system components',
        'Draw boundaries between components',
        'Test each component in isolation',
        'Narrow down to the failing component',
        'Apply recursively if needed',
      ],
      keyPrinciple: 'Isolated components are easier to debug than integrated systems.',
    },
    example: {
      scenario: 'Users report "Login not working"',
      walkthrough: `System: Browser → API Gateway → Auth Service → Database

Step 1: Divide at the API Gateway
- curl directly to Auth Service: Works!
- So problem is before Auth Service

Step 2: Divide at the browser
- Browser network tab shows 403 from Gateway
- Gateway is the problem area

Step 3: Examine Gateway
- Gateway logs show: "Invalid CORS origin"
- Frontend deployed to new domain, Gateway CORS not updated

Step 4: Verify fix
- Update Gateway CORS config
- Test end-to-end: Works!

The bug was in Gateway config, not in Auth Service or Database where one might have looked first.`,
      insight: 'Isolating each component quickly narrowed from 4 potential problem areas to 1.',
    },
    commonMistakes: [
      'Not having good component boundaries',
      'Testing integration before isolation',
      'Skipping layers ("it can\'t be the database...")',
    ],
    toolParameters: {
      approachName: 'divide_conquer',
      issue: 'Your issue description',
    },
  },
  backtracking: {
    name: 'backtracking',
    title: 'Backtracking',
    description: 'Trace execution paths backwards from the error to find the source.',
    whenToUse: [
      'When you have a stack trace',
      'When data is corrupted and you need to find where',
      'When a value is wrong and you need to find who set it',
      'Event chain debugging',
    ],
    technique: {
      steps: [
        'Start at the point of failure',
        'Examine the immediate inputs/state',
        'Trace back: where did these inputs come from?',
        'Continue backwards until you find the root cause',
      ],
      keyPrinciple: 'Follow the trail of data backwards through time.',
    },
    example: {
      scenario: 'Customer charged wrong amount ($100 instead of $10)',
      walkthrough: `Error point: Stripe charge of $100

Backtrack 1: What called Stripe?
→ PaymentService.processPayment(orderId, 10000) // 10000 cents?

Backtrack 2: Where did 10000 come from?
→ OrderService.calculateTotal() returned 10000

Backtrack 3: What calculated 10000?
→ items.reduce((sum, item) => sum + item.price, 0)
→ Item price was 10000 (expected 1000)

Backtrack 4: Where was item price set?
→ ProductService.getProduct() returned price: 10000

Backtrack 5: Why is product price wrong?
→ Recent migration: prices changed from dollars to cents
→ This product wasn't migrated

Root cause: Incomplete data migration left some products in dollars while system expected cents.`,
      insight: 'Systematic backtracking through the data flow revealed the migration gap.',
    },
    commonMistakes: [
      'Stopping too early ("that looks right")',
      'Not following the data, just the code',
      'Assuming state is what you expect',
    ],
    toolParameters: {
      approachName: 'backtracking',
      issue: 'Your issue description',
    },
  },
  cause_elimination: {
    name: 'cause_elimination',
    title: 'Cause Elimination',
    description: 'Systematically eliminate potential causes until the root cause remains.',
    whenToUse: [
      'Intermittent/flaky bugs',
      'Bugs that only happen in certain environments',
      'Multi-factor problems',
      'When you have many suspects',
    ],
    technique: {
      steps: [
        'List all possible causes (brainstorm liberally)',
        'For each cause, design a test that would eliminate it',
        'Execute tests, eliminating causes that don\'t reproduce',
        'The remaining causes are your focus',
      ],
      keyPrinciple: 'When you have eliminated the impossible, whatever remains must be the truth.',
    },
    example: {
      scenario: 'Tests pass locally but fail in CI randomly (~30% of runs)',
      walkthrough: `Possible causes:
1. Race condition in test
2. Different Node version
3. Different timezone
4. Network flakiness
5. Memory/resource constraints
6. Test order dependency

Elimination tests:

Test 1: Run same test 100x locally with --randomize-order
→ 2 failures! Eliminates #2, #3, #4, #5
→ Confirms order dependency or race condition

Test 2: Find failing order, run deterministically
→ Still fails! Not truly random - it's test order
→ Confirms #6, eliminates #1

Test 3: Analyze failing order
→ Test A runs before Test B
→ Test A doesn't clean up database
→ Test B assumes empty database

Root cause: Missing cleanup in Test A.
Fix: Add afterEach cleanup hook.`,
      insight: 'Systematic elimination narrowed 6 causes to 1 in just 3 experiments.',
    },
    commonMistakes: [
      'Not listing enough possible causes',
      'Tests that don\'t actually eliminate causes',
      'Giving up before all causes tested',
    ],
    toolParameters: {
      approachName: 'cause_elimination',
      issue: 'Your issue description',
    },
  },
  program_slicing: {
    name: 'program_slicing',
    title: 'Program Slicing',
    description: 'Extract the subset of code that affects a specific variable or output.',
    whenToUse: [
      'Understanding where a value comes from',
      'Finding all code that could affect an outcome',
      'Reducing scope for code review',
      'Security analysis (data flow)',
    ],
    technique: {
      steps: [
        'Identify the variable or output of interest',
        'Find all statements that directly affect it',
        'Recursively find statements affecting those statements',
        'The slice is the minimal code affecting your variable',
      ],
      keyPrinciple: 'Ignore code that can\'t possibly affect your variable of interest.',
    },
    example: {
      scenario: 'Why is user.permissions wrong after login?',
      walkthrough: `Target: user.permissions at line 150

Slice backwards:

Line 150: return user;
Line 145: user.permissions = merged;
Line 140: merged = [...defaults, ...custom];
Line 135: custom = await db.getPermissions(user.id);
Line 130: defaults = getDefaultPermissions(user.role);
Line 125: user.role = decoded.role;
Line 120: decoded = jwt.verify(token);
Line 115: token = req.headers.authorization;

Slice = lines 115, 120, 125, 130, 135, 140, 145, 150

All other code (500+ lines in the file) is irrelevant to permissions.

Analysis of slice:
- Line 130: getDefaultPermissions('user') returns []
- Line 135: db query returns correct custom permissions
- Line 140: merged = [] + custom = custom only

Bug: getDefaultPermissions returns empty array for 'user' role.
Fix: Update defaults for 'user' role.`,
      insight: 'Slicing reduced 500+ lines to 8 relevant lines, making the bug obvious.',
    },
    commonMistakes: [
      'Following control flow instead of data flow',
      'Missing indirect effects',
      'Including irrelevant code in the slice',
    ],
    toolParameters: {
      approachName: 'program_slicing',
      issue: 'Your issue description',
    },
  },
};

/**
 * Extended debug approach type definition
 */
interface ExtendedDebugApproach {
  name: string;
  title: string;
  description: string;
  whenToUse: string[];
  technique: {
    steps: string[];
    timeComplexity?: string;
    keyPrinciple?: string;
  };
  example: {
    scenario: string;
    walkthrough: string;
    insight: string;
  };
  commonMistakes: string[];
  toolParameters: {
    approachName: string;
    issue: string;
  };
}

/**
 * Get a specific debug approach's extended details
 */
export function getExtendedDebugApproach(approachName: string): ExtendedDebugApproach | null {
  return EXTENDED_DEBUG_APPROACHES[approachName] || null;
}

/**
 * Get all available extended debug approach names
 */
export function getExtendedDebugApproachNames(): string[] {
  return Object.keys(EXTENDED_DEBUG_APPROACHES);
}

/**
 * Handle resource read for extended debug approaches
 * URI format: think://debug-approaches/{approach_name}
 */
export async function handleExtendedDebugApproachRead(uri: URL): Promise<ReadResourceResult> {
  const approachName = uri.pathname.replace(/^\//, '');
  const approach = getExtendedDebugApproach(approachName);

  if (!approach) {
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({
            error: 'Debug approach not found',
            availableApproaches: getExtendedDebugApproachNames(),
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
        text: JSON.stringify(approach, null, 2),
      },
    ],
  };
}
