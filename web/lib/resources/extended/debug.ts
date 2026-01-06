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
  wolf_fence: {
    name: 'wolf_fence',
    title: 'Wolf Fence Algorithm',
    description: 'Use binary isolation to systematically narrow down the location of a bug.',
    whenToUse: [
      'Isolating intermittent bugs in large codebases',
      'Finding performance regressions across many changes',
      'Debugging when the exact bug location is unknown',
      'Narrowing down which module or function fails',
    ],
    technique: {
      steps: [
        'Place a checkpoint in the middle of the suspect region',
        'Test to determine if the bug occurs before or after the checkpoint',
        'Eliminate the half that doesn\'t contain the bug',
        'Repeat with the remaining half until isolated',
      ],
      keyPrinciple: 'There\'s one wolf in Alaska. Build a fence down the middle. Which side is he on? Build another fence down the middle of that half.',
    },
    example: {
      scenario: 'API endpoint returns 500 error but logs show no errors. Bug is somewhere in 200-line request handler.',
      walkthrough: `Request handler: lines 1-200

Checkpoint 1 (line 100): Add logging
→ console.log('Checkpoint 100:', data)
Run test: Log appears, but response still 500
Conclusion: Bug is AFTER line 100 (lines 101-200)

Checkpoint 2 (line 150): Add logging
→ console.log('Checkpoint 150:', result)
Run test: Log does NOT appear, response 500
Conclusion: Bug is BEFORE line 150 (lines 101-150)

Checkpoint 3 (line 125): Add logging
→ console.log('Checkpoint 125:', processed)
Run test: Log appears, response still 500
Conclusion: Bug is AFTER line 125 (lines 126-150)

Checkpoint 4 (line 138): Add logging
→ console.log('Checkpoint 138:', validated)
Run test: Log does NOT appear
Conclusion: Bug is in lines 126-138

Manual review of 13 lines:
Line 132: await validateSchema(data);
→ This throws but error is swallowed!

Bug: Missing try-catch around validateSchema().
Fix: Add error handling and return proper 400 response.`,
      insight: 'Wolf Fence reduced the search space from 200 lines to 13 lines in just 4 iterations (log₂ 200 ≈ 8).',
    },
    commonMistakes: [
      'Not checking if the checkpoint itself affects the bug',
      'Choosing non-representative test cases',
      'Stopping too early before full isolation',
      'Forgetting to remove debugging checkpoints after finding the bug',
    ],
    toolParameters: {
      approachName: 'wolf_fence',
      issue: 'Your issue description',
    },
  },
  rubber_duck: {
    name: 'rubber_duck',
    title: 'Rubber Duck Debugging',
    description: 'Explain code and problem step-by-step to reveal overlooked assumptions.',
    whenToUse: [
      'Stuck on a bug with no clear next steps',
      'Code looks correct but behaves incorrectly',
      'Finding hidden assumptions in logic',
      'Clarifying complex problem statements',
    ],
    technique: {
      steps: [
        'Explain what you\'re trying to accomplish',
        'Walk through the code line by line, explaining what each part does',
        'State your assumptions explicitly ("I assume X is always Y")',
        'Often the bug reveals itself during explanation',
      ],
      keyPrinciple: 'Articulating the problem forces you to challenge your assumptions.',
    },
    example: {
      scenario: 'Shopping cart total is sometimes wrong, but the calculation code looks correct.',
      walkthrough: `"Okay duck, here's the problem. Users report the cart total is wrong sometimes.

Let me explain the code:

1. We loop through cart.items
   → Hmm, I'm assuming cart.items is always an array
   → Let me check... yes, it's initialized as []

2. For each item, we do: total += item.price * item.quantity
   → I'm assuming item.price is a number
   → Wait... what if it's a string from the API?

3. Let me check the API response...
   → Oh! The API returns price as a string: "19.99"
   → In JavaScript: "19.99" * 2 = 39.98 (works)
   → But: 0 + "19.99" = "019.99" (string concatenation!)
   → Then: "019.99" + "29.99" = "019.9929.99" (broken!)

Found it! The initial total = 0 should be total = 0.0 or we should parse the price:
→ total += parseFloat(item.price) * item.quantity

Let me test... yes, that fixes it!"`,
      insight: 'Explaining "I\'m assuming price is a number" revealed the type coercion bug.',
    },
    commonMistakes: [
      'Rushing through the explanation without detail',
      'Skipping "obvious" parts where the bug often hides',
      'Not stating assumptions out loud',
      'Giving up if the bug isn\'t immediately obvious',
    ],
    toolParameters: {
      approachName: 'rubber_duck',
      issue: 'Your issue description',
    },
  },
  delta_debugging: {
    name: 'delta_debugging',
    title: 'Delta Debugging',
    description: 'Systematically minimize test cases to find the minimal failing scenario.',
    whenToUse: [
      'Bug reports with complex reproduction steps',
      'Failures that only occur with specific inputs',
      'Simplifying large failing test cases',
      'Finding which part of input causes the failure',
    ],
    technique: {
      steps: [
        'Start with a failing test case',
        'Remove half the input/steps and test',
        'If still fails, continue with smaller input',
        'If passes, the removed part was needed - try removing the other half',
        'Repeat until you have the minimal failing case',
      ],
      keyPrinciple: 'The smallest input that reproduces the bug is the easiest to debug.',
    },
    example: {
      scenario: 'Parser crashes on a 10,000-line JSON file. Need to find minimal failing input.',
      walkthrough: `Original: 10,000-line JSON file → crashes

Delta 1: Try first 5,000 lines → still crashes
→ Bug is in first half

Delta 2: Try first 2,500 lines → still crashes
→ Bug is in first quarter

Delta 3: Try first 1,250 lines → passes!
→ Bug is between lines 1,250-2,500

Delta 4: Try lines 1,250-1,875 → crashes
→ Bug is in this range

Delta 5: Try lines 1,250-1,562 → crashes
→ Narrowing down...

Continue until minimal case:

{
  "users": [
    {
      "name": "test",
      "age": 25,
      "tags": ["admin", null]
    }
  ]
}

Found it! Parser crashes when array contains null.

Minimal reproduction: {"tags": [null]}

The bug: Parser doesn't handle null values in arrays.
Fix: Add null check in array parser.`,
      insight: 'Reduced 10,000 lines to 1 line, making the null-handling bug obvious.',
    },
    commonMistakes: [
      'Removing too little at each step (slow progress)',
      'Not verifying the minimized case still fails',
      'Stopping before reaching truly minimal case',
      'Not preserving structural validity when removing parts',
    ],
    toolParameters: {
      approachName: 'delta_debugging',
      issue: 'Your issue description',
    },
  },
  fault_tree: {
    name: 'fault_tree',
    title: 'Fault Tree Analysis',
    description: 'Map all possible failure paths to systematically analyze root causes.',
    whenToUse: [
      'Complex system failures with multiple potential causes',
      'Understanding cascading failures',
      'Risk assessment in debugging',
      'Multi-factor bugs requiring holistic view',
    ],
    technique: {
      steps: [
        'Identify the top-level failure event (the symptom)',
        'List all immediate causes that could lead to this failure',
        'For each cause, identify sub-causes (build the tree)',
        'Mark causal relationships (AND gates: all must fail, OR gates: any can fail)',
        'Trace from leaves to root to find actual cause',
      ],
      keyPrinciple: 'A tree of possibilities is clearer than a tangle of guesses.',
    },
    example: {
      scenario: 'Users cannot upload files. Multiple subsystems involved.',
      walkthrough: `Top Event: File Upload Fails
                    |
        -------------------------
        |           |           |
    Frontend    Network     Backend
      Fails      Fails       Fails
        |           |           |
    ----+----   ----+----   ----+----
    |       |   |       |   |       |
   JS     Form  CORS   Timeout Storage Auth
  Error   Invalid Blocked         Full  Reject

AND gate: Frontend succeeds AND Network succeeds AND Backend succeeds → Upload works
OR gate: ANY of the leaves fails → Upload fails

Investigation:
✓ JS Error: Console clean
✓ Form Invalid: Form validates correctly
✓ CORS: Headers present in network tab
✗ Timeout: Request takes 45 seconds, times out at 30s
✓ Storage Full: Disk has space
✓ Auth Reject: Auth token valid

Narrowed to: Network Timeout (OR branch triggered)

Why timeout?
        Timeout (30s)
             |
     ----------------
     |              |
  Slow Upload   Slow Processing
     |              |
  ----+----    ----+----
  |       |    |       |
 Large  Slow  Virus  Image
 File   Wifi  Scan   Processing

Testing:
- Large File (50MB): Times out
- Small File (1MB): Works!

Root cause: No chunked upload for large files + 30s timeout too short.

Fix: Implement chunked upload OR increase timeout to 5 minutes.`,
      insight: 'Fault tree systematically eliminated 8 potential causes to find timeout issue.',
    },
    commonMistakes: [
      'Not exhaustively listing all possible causes',
      'Confusing correlation with causation',
      'Missing AND/OR gate logic (multi-factor failures)',
      'Building the tree too deep before testing branches',
    ],
    toolParameters: {
      approachName: 'fault_tree',
      issue: 'Your issue description',
    },
  },
  time_travel: {
    name: 'time_travel',
    title: 'Time Travel Debugging',
    description: 'Record execution state to step backward and forward through program history.',
    whenToUse: [
      'Debugging race conditions and timing bugs',
      'Understanding how state becomes corrupted',
      'Analyzing event sequences that lead to failure',
      'Reproducing hard-to-catch intermittent bugs',
    ],
    technique: {
      steps: [
        'Set up execution recording (debugger with replay, or manual snapshots)',
        'Run the program until the bug occurs',
        'Step backwards to before the bug manifested',
        'Step forward slowly, watching state changes',
        'Identify the exact instruction where state corrupts',
      ],
      keyPrinciple: 'When you can rewind time, you never miss the moment the bug happens.',
    },
    example: {
      scenario: 'Array becomes corrupted but only in production. Local debugging doesn\'t show when.',
      walkthrough: `Using conceptual time-travel (state snapshots):

Step 1: Add state snapshots
const snapshots = [];
function snapshot(label) {
  snapshots.push({
    time: Date.now(),
    label,
    state: JSON.parse(JSON.stringify(globalState))
  });
}

Step 2: Instrument the code
snapshot('after init');
processItems(items);
snapshot('after process');
validateData(data);
snapshot('after validate');
sendToServer(data);
snapshot('after send');

Step 3: Run until failure
Server receives corrupted data!

Step 4: Review snapshots backwards
- after send: data = [1, 2, undefined, 4] ← CORRUPTED
- after validate: data = [1, 2, undefined, 4] ← Already corrupted
- after process: data = [1, 2, 3, 4] ← CLEAN
- after init: data = [1, 2, 3, 4] ← CLEAN

Bug introduced: During validate()!

Step 5: Add more granular snapshots in validate()
function validate(data) {
  snapshot('validate:start');
  for (let i = 0; i < data.length; i++) {
    snapshot(\`validate:before-\${i}\`);
    if (data[i] < 0) {
      data.splice(i, 1); // BUG: modifying array while iterating!
      snapshot(\`validate:after-splice-\${i}\`);
    }
  }
  return data;
}

Step 6: Time-travel through the snapshots
- validate:before-2: data = [1, 2, 3, 4], i = 2
- validate:after-splice-2: data = [1, 2, 4], i = 2 ← Skipped checking 4!
- When i=3, accesses undefined

Root cause: splice() during iteration skips elements.
Fix: Iterate backwards or filter instead:
→ data = data.filter(x => x >= 0)`,
      insight: 'State snapshots (manual time-travel) revealed the exact mutation that corrupted the array.',
    },
    commonMistakes: [
      'Not taking frequent enough snapshots',
      'Snapshot overhead affecting timing (Heisenberg)',
      'Not preserving complete state (shallow copies)',
      'Forgetting to remove instrumentation after debugging',
    ],
    toolParameters: {
      approachName: 'time_travel',
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
