/**
 * Extended Mental Models Resource
 *
 * Provides detailed views of individual mental models with examples.
 * Accessed via think://models/{model_name}
 */

import { ReadResourceResult } from '../types';

/**
 * Extended mental model definitions with examples
 */
const EXTENDED_MODELS: Record<string, ExtendedModel> = {
  first_principles: {
    name: 'first_principles',
    title: 'First Principles Thinking',
    description: 'Break down complex problems to their fundamental truths and build up from there.',
    whenToUse: [
      'When facing a novel problem without existing solutions',
      'When conventional approaches have failed',
      'When you need to challenge established assumptions',
      'When innovating or designing from scratch',
    ],
    steps: [
      'Identify the problem and all associated assumptions',
      'Break down the problem to its fundamental, indisputable truths',
      'Question each assumption: "Is this really true?"',
      'Reconstruct a solution from the fundamental truths',
      'Validate the new solution against the original problem',
    ],
    example: {
      context: 'Elon Musk reducing battery costs for Tesla',
      application: `Instead of accepting that batteries cost $600/kWh because that's what they've always cost, Musk asked: "What are the material constituents of the batteries? What is the spot market value of the material constituents?"

He found that buying metals on the London Metal Exchange, the raw materials only cost $80/kWh. This led to building a new battery factory to manufacture at scale, achieving dramatic cost reductions.

The key insight: break down to raw materials and physics, not industry conventions.`,
    },
    relatedModels: ['opportunity_cost', 'occams_razor'],
    toolParameters: {
      modelName: 'first_principles',
      problem: 'Your problem statement here',
      steps: ['Step-by-step breakdown'],
    },
  },
  opportunity_cost: {
    name: 'opportunity_cost',
    title: 'Opportunity Cost Analysis',
    description: 'Evaluate trade-offs by considering what you give up when choosing one option over another.',
    whenToUse: [
      'When making resource allocation decisions',
      'When prioritizing between multiple options',
      'When evaluating investments of time or money',
      'When saying yes means saying no to something else',
    ],
    steps: [
      'List all available options clearly',
      'Estimate the value/benefit of each option',
      'For each choice, identify what you sacrifice by not choosing alternatives',
      'Calculate the true cost: explicit costs + opportunity cost',
      'Choose the option with the best net value',
    ],
    example: {
      context: 'Deciding whether to attend graduate school',
      application: `Explicit costs: $100,000 in tuition and fees over 2 years

Opportunity cost:
- 2 years of salary (~$150,000 if earning $75k/year)
- 2 years of career advancement
- Work experience and connections

True cost: ~$250,000 + intangibles

This doesn't mean grad school is wrong, but the analysis reveals you need significant benefits to justify it. A $20k/year salary increase would take 12+ years to break even.`,
    },
    relatedModels: ['pareto_principle', 'first_principles'],
    toolParameters: {
      modelName: 'opportunity_cost',
      problem: 'Your decision statement here',
      steps: ['Options and their costs'],
    },
  },
  error_propagation: {
    name: 'error_propagation',
    title: 'Error Propagation Understanding',
    description: 'Track how errors compound and spread through a system to identify critical failure points.',
    whenToUse: [
      'When debugging cascading failures',
      'When designing fault-tolerant systems',
      'When analyzing system reliability',
      'When a small error causes disproportionate problems',
    ],
    steps: [
      'Map the system components and their dependencies',
      'Identify all potential error sources',
      'Trace how each error type propagates through dependencies',
      'Calculate error amplification at each step',
      'Prioritize fixes at points of maximum error amplification',
    ],
    example: {
      context: 'Debugging a data pipeline failure',
      application: `A user reported wrong dashboard numbers. Tracing backwards:

Dashboard ← Aggregation Service ← Data Warehouse ← ETL Pipeline ← Source Database

The ETL pipeline had a timezone bug: UTC timestamps were interpreted as local time, causing 5-hour data shifts. This small error:
- Affected 15% of records
- Caused aggregations to include wrong day's data
- Made trends appear inverted
- Led to incorrect business decisions

The fix was simple (timezone handling), but the impact was massive. Error propagation analysis revealed this was a "thin point" where small errors amplify significantly.`,
    },
    relatedModels: ['rubber_duck', 'occams_razor'],
    toolParameters: {
      modelName: 'error_propagation',
      problem: 'Your system failure description',
      steps: ['Component dependency mapping'],
    },
  },
  rubber_duck: {
    name: 'rubber_duck',
    title: 'Rubber Duck Debugging',
    description: 'Explain your problem step-by-step to gain clarity and discover solutions.',
    whenToUse: [
      'When stuck on a bug you cannot figure out',
      'When your code "should work" but doesn\'t',
      'When you need to understand complex logic',
      'Before asking a colleague for help',
    ],
    steps: [
      'State the problem you are trying to solve',
      'Explain what your code is supposed to do, line by line',
      'For each line, explain what actually happens',
      'Notice the gap between intended and actual behavior',
      'The solution often reveals itself during explanation',
    ],
    example: {
      context: 'Debugging a user authentication failure',
      application: `"Okay rubber duck, users can't log in. Let me explain:

1. User enters credentials → I receive them in the handler ✓
2. I hash the password with bcrypt → wait, let me check... I'm using MD5?!
3. I compare with database...

Oh. I'm hashing with MD5 but the passwords were stored with bcrypt. Of course they never match."

The bug was found at step 2, not by analyzing code, but by explaining it. The act of explanation forced attention to details that scanning code missed.`,
    },
    relatedModels: ['first_principles', 'error_propagation'],
    toolParameters: {
      modelName: 'rubber_duck',
      problem: 'Your bug or confusion',
      steps: ['Line-by-line explanation'],
    },
  },
  pareto_principle: {
    name: 'pareto_principle',
    title: 'Pareto Principle (80/20 Rule)',
    description: 'Focus on the 20% of efforts that produce 80% of results.',
    whenToUse: [
      'When overwhelmed with tasks',
      'When optimizing for productivity',
      'When resources are limited',
      'When deciding what to cut or prioritize',
    ],
    steps: [
      'List all activities/inputs contributing to your goal',
      'Measure or estimate the impact of each',
      'Rank by impact (highest first)',
      'Identify the ~20% producing ~80% of results',
      'Focus energy on high-impact items; minimize or eliminate low-impact',
    ],
    example: {
      context: 'Reducing customer support ticket volume',
      application: `Analysis of 1,000 support tickets:

Top issues:
- Password reset: 280 tickets (28%)
- Payment confusion: 220 tickets (22%)
- Feature not working: 180 tickets (18%)
- Account settings: 120 tickets (12%)
- All other issues: 200 tickets (20%)

The top 3 issues (representing "20%" of issue types) cause 68% of tickets.

Solution: Add self-service password reset, clarify payment UI, fix the feature bug.

Result: Ticket volume dropped 60% by fixing just 3 root causes.`,
    },
    relatedModels: ['opportunity_cost', 'first_principles'],
    toolParameters: {
      modelName: 'pareto_principle',
      problem: 'Your optimization goal',
      steps: ['Impact ranking of contributing factors'],
    },
  },
  occams_razor: {
    name: 'occams_razor',
    title: "Occam's Razor",
    description: 'Prefer the simplest explanation that fits the evidence.',
    whenToUse: [
      'When multiple explanations exist for a problem',
      'When debugging mysterious issues',
      'When evaluating hypotheses',
      'When tendency is to overcomplicate',
    ],
    steps: [
      'List all possible explanations for the observation',
      'For each, count the assumptions required',
      'Eliminate explanations that don\'t fit the evidence',
      'Among remaining, prefer the one with fewest assumptions',
      'Test the simplest hypothesis first',
    ],
    example: {
      context: 'Website loading slowly for some users',
      application: `Observations: Site is slow for users in Europe but fast in US.

Hypotheses:
1. CDN misconfiguration in European region (1 assumption)
2. Database connection pooling issues under high EU traffic (3 assumptions)
3. Targeted attack from European botnets (5 assumptions)
4. ISP throttling our traffic in EU (4 assumptions)

Apply Occam's Razor: Check CDN config first.

Result: European CDN edge servers weren't deployed. One config change fixed it.

The complex hypotheses were possible but unlikely. Starting simple saved hours.`,
    },
    relatedModels: ['first_principles', 'rubber_duck'],
    toolParameters: {
      modelName: 'occams_razor',
      problem: 'Your observation requiring explanation',
      steps: ['Hypothesis complexity ranking'],
    },
  },
  swot_analysis: {
    name: 'swot_analysis',
    title: 'SWOT Analysis',
    description: 'Evaluate Strengths, Weaknesses, Opportunities, and Threats to make strategic decisions.',
    whenToUse: [
      'When evaluating a business strategy or market position',
      'When making major strategic decisions or pivots',
      'When assessing competitive advantages and vulnerabilities',
      'When planning product launches or entering new markets',
      'When conducting annual strategic planning or reviews',
    ],
    steps: [
      'Identify Strengths: Internal positive attributes, resources, capabilities, and competitive advantages you currently possess',
      'Identify Weaknesses: Internal limitations, resource gaps, skill deficits, and areas where competitors outperform you',
      'Identify Opportunities: External favorable conditions, market trends, emerging technologies, or environmental factors you can leverage',
      'Identify Threats: External risks, competitive pressures, market shifts, regulatory changes, or trends that could harm your position',
      'Analyze intersections: Match Strengths with Opportunities (growth strategies), shore up Weaknesses against Threats (defensive strategies)',
    ],
    example: {
      context: 'A small independent coffee shop evaluating whether to expand delivery services',
      application: `Strengths (Internal Positive):
- Loyal local customer base with 4.8-star reviews
- High-quality artisanal coffee and unique blends
- Experienced baristas who know regular customers
- Strong Instagram presence with 12K local followers

Weaknesses (Internal Negative):
- Limited capital for technology investment
- No existing delivery infrastructure or partnerships
- Small team already at capacity during peak hours
- Higher prices than chain competitors

Opportunities (External Positive):
- 40% increase in local delivery app usage post-pandemic
- New residential developments opening nearby (500+ units)
- Competitors have poor delivery ratings (slow, cold coffee)
- Local food delivery co-op forming to compete with DoorDash

Threats (External Negative):
- Starbucks launching aggressive delivery promotions
- Rising ingredient costs affecting margins
- Delivery apps taking 25-30% commission
- Customer expectations for 30-minute delivery windows

Strategic Insight:
Instead of competing on speed with chain competitors, leverage Strengths (quality, loyal customers) with Opportunity (delivery co-op) to create a premium "coffee subscription" delivery service. Partner with the local co-op to avoid high fees, focus on scheduled morning deliveries where quality matters more than instant gratification. This plays to strengths while avoiding the cash-intensive competition with chains.`,
    },
    relatedModels: ['opportunity_cost', 'second_order_effects', 'pre_mortem'],
    toolParameters: {
      modelName: 'swot_analysis',
      problem: 'Your strategic decision or evaluation',
      steps: ['Strengths, Weaknesses, Opportunities, Threats analysis'],
    },
  },
  six_thinking_hats: {
    name: 'six_thinking_hats',
    title: 'Six Thinking Hats (De Bono)',
    description: 'Explore different perspectives systematically by wearing six metaphorical "hats" representing different thinking modes.',
    whenToUse: [
      'When group discussions become argumentative or stuck in one perspective',
      'When you need creative solutions and diverse viewpoints',
      'When making complex decisions that benefit from multiple angles',
      'When facilitating productive meetings with conflicting stakeholders',
      'When you want to separate emotion from logic in problem-solving',
    ],
    steps: [
      'White Hat (Facts & Information): Focus purely on available data, facts, and information. What do we know? What data is missing? Be objective and neutral, like a computer presenting facts.',
      'Red Hat (Emotions & Intuition): Express feelings, hunches, and gut reactions without justification. How do we feel about this? Trust intuition. No need to explain or defend emotional responses.',
      'Black Hat (Caution & Risks): Identify potential problems, risks, and weaknesses. What could go wrong? Play devil\'s advocate. Be critical and cautious, highlighting dangers and downsides.',
      'Yellow Hat (Optimism & Benefits): Explore positive aspects, benefits, and opportunities. What are the best-case scenarios? Be constructive and optimistic, finding value and advantages.',
      'Green Hat (Creativity & Alternatives): Generate new ideas, possibilities, and creative solutions. Think outside the box. Brainstorm alternatives without judgment. Embrace lateral thinking.',
      'Blue Hat (Process Control & Summary): Manage the thinking process itself. Set the agenda, ensure all hats are used, summarize insights, and facilitate decision-making. The "conductor" of the thinking orchestra.',
    ],
    example: {
      context: 'A product team debating whether to add AI-powered chatbot support to their SaaS application',
      application: `Blue Hat (Process): "Let's examine this chatbot proposal systematically. We'll spend 5 minutes on each hat."

White Hat (Facts):
- Current support volume: 1,200 tickets/month, 40% are repetitive questions
- Average response time: 4 hours
- Support team: 3 people, costs $180K/year
- Chatbot implementation estimate: $50K initial + $15K/year maintenance
- Industry data: Chatbots resolve 60-70% of common queries

Red Hat (Emotions):
- Sarah (Product): "I'm excited! This feels innovative and customer-friendly."
- Mike (Support): "I'm anxious. What if customers hate talking to a bot? I feel protective of our personal touch."
- Lisa (Finance): "My gut says this is smart, but I'm nervous about upfront costs."

Black Hat (Risks):
- 30-40% of queries may still need human intervention
- Poor chatbot UX could frustrate customers and damage brand
- Initial implementation might have bugs, creating more work short-term
- Team might resist, fearing job security
- Could feel impersonal, losing our "high-touch service" differentiator

Yellow Hat (Benefits):
- 24/7 support availability (huge for international customers!)
- Instant responses to common questions
- Support team can focus on complex, high-value interactions
- Scalable: handles volume spikes without hiring
- Data collection: chatbot logs reveal common pain points
- Competitive advantage if done well

Green Hat (Creativity):
- Hybrid approach: Chatbot handles tier-1, seamless handoff to humans for tier-2
- Train chatbot on our unique brand voice to maintain personality
- Use chatbot data to create a "smart FAQ" that learns
- Offer both options: "Chat with AI (instant)" vs "Talk to human (4-hour wait)"
- Start with a 3-month pilot on 50% of users, A/B test satisfaction

Blue Hat (Summary & Decision):
Based on our exploration:
- Facts support potential ROI and efficiency gains (White)
- Team has mixed emotions, need to address Mike's concerns (Red)
- Real risks exist around UX and brand perception (Black)
- Significant upside if implemented well (Yellow)
- Hybrid pilot approach mitigates risks while testing value (Green)

Decision: Proceed with 3-month hybrid pilot. Success metrics: response time, customer satisfaction scores, support team workload. Mike leads UX design to ensure brand alignment.`,
    },
    relatedModels: ['swot_analysis', 'pre_mortem', 'first_principles'],
    toolParameters: {
      modelName: 'six_thinking_hats',
      problem: 'Your decision or problem requiring multiple perspectives',
      steps: ['White (facts), Red (feelings), Black (risks), Yellow (benefits), Green (ideas), Blue (process)'],
    },
  },
  mece: {
    name: 'mece',
    title: 'MECE (Mutually Exclusive, Collectively Exhaustive)',
    description: 'Structure problems into categories that don\'t overlap (mutually exclusive) while covering all possibilities (collectively exhaustive).',
    whenToUse: [
      'When breaking down complex problems that need comprehensive analysis',
      'When creating frameworks, segmentations, or categorizations',
      'When you need to ensure nothing is missed and nothing is double-counted',
      'When presenting to executives or clients who need clear, complete structures',
      'When organizing data, issues, or options into logical groupings',
    ],
    steps: [
      'Define the problem or universe you\'re analyzing clearly',
      'Identify the most logical dimension or criterion to segment by (e.g., customer type, time period, geography, process step)',
      'Create categories that are Mutually Exclusive (ME): No overlap - each item fits into only one category. No double-counting or ambiguity.',
      'Ensure categories are Collectively Exhaustive (CE): Complete coverage - every possible item has a category. Nothing falls through the cracks.',
      'Test your structure: Can you place every element into exactly one bucket? Does every element have a home?',
      'Refine if needed: If items overlap or don\'t fit, adjust your categories or segmentation criterion',
    ],
    example: {
      context: 'A consulting firm analyzing why a retail company\'s revenue declined 15% year-over-year',
      application: `Initial attempt (NOT MECE):
"Revenue declined because of: poor marketing, losing customers, bad products, competition"

Problems:
- "Losing customers" and "poor marketing" overlap (not mutually exclusive)
- Doesn't cover all possibilities like pricing or distribution (not collectively exhaustive)

MECE Framework:
Revenue = Number of Customers × Average Transaction Value × Purchase Frequency

Therefore, revenue decline must come from changes in one or more of these three factors:

1. Customer Acquisition & Retention (Number of Customers)
   - New customers acquired: Down 20% (marketing effectiveness declined)
   - Customer churn rate: Up from 15% to 22% (retention issues)

2. Transaction Value (Average Purchase Amount)
   - Average basket size: Down 8% (customers buying fewer items per visit)
   - Product mix shift: Shift from high-margin to low-margin items

3. Purchase Frequency (How Often Customers Buy)
   - Visit frequency: Flat (no change)
   - Seasonal patterns: Normal (no change)

Analysis reveals:
- Customer count dropped 12% (factor 1)
- Transaction value dropped 8% (factor 2)
- Frequency unchanged (factor 3)
- Combined effect: ~15% revenue decline ✓

This is MECE because:
✓ Mutually Exclusive: A dollar of lost revenue comes from EITHER fewer customers, OR smaller baskets, OR less frequent purchases. These don't overlap.
✓ Collectively Exhaustive: Revenue MUST equal customers × transaction × frequency. There's no fourth factor. Everything is covered.

Outcome:
With this structure, the team identified that customer acquisition dropped due to reduced digital ad spending (60% budget cut), and retention suffered from out-of-stock issues in key categories. These insights led to targeted fixes rather than broad, unfocused initiatives.

Contrast with non-MECE approach:
"We have marketing problems, product problems, and competitive problems" leads to scattered efforts because these categories overlap and don't cleanly separate root causes.`,
    },
    relatedModels: ['first_principles', 'swot_analysis', 'five_whys'],
    toolParameters: {
      modelName: 'mece',
      problem: 'Your problem requiring structured breakdown',
      steps: ['Define universe', 'Choose segmentation criterion', 'Create non-overlapping categories', 'Ensure complete coverage'],
    },
  },
  inversion_thinking: {
    name: 'inversion_thinking',
    title: 'Inversion Thinking',
    description: 'Approach problems by inverting them - instead of asking how to succeed, ask how to fail, then avoid those things.',
    whenToUse: [
      'When direct problem-solving approaches aren\'t working',
      'When you want to identify and avoid critical mistakes',
      'When planning complex projects with many failure modes',
      'When "what could go wrong?" is more valuable than "what could go right?"',
      'When you need to stress-test a strategy or decision',
    ],
    steps: [
      'State your goal clearly (what you want to achieve)',
      'Invert the problem: Ask "What would guarantee failure?" or "How could this go terribly wrong?"',
      'List all the ways to fail comprehensively - be specific and ruthless',
      'For each failure mode, identify the root cause or behavior that creates it',
      'Create strategies to avoid each failure mode - these become your success factors',
      'Focus on NOT doing the stupid things rather than trying to be brilliant',
    ],
    example: {
      context: 'Charlie Munger on building a successful investment portfolio',
      application: `Traditional approach: "How do I pick winning stocks and maximize returns?"

Munger's inversion: "How do I guarantee I'll lose money and destroy wealth?"

Ways to guarantee investment failure:
1. Chase hot tips and trends without understanding the business
   → Avoid: Never invest in something you don't understand

2. Use leverage and borrowed money to amplify bets
   → Avoid: Don't use margin or debt for speculation

3. Panic sell during market downturns
   → Avoid: Have emotional discipline; don't check portfolio daily

4. Pay high fees to active managers who underperform
   → Avoid: Minimize fees; favor low-cost index funds for most holdings

5. Fail to diversify - put all eggs in one basket
   → Avoid: Spread risk across uncorrelated assets

6. Trade frequently, racking up taxes and transaction costs
   → Avoid: Buy and hold quality businesses; let compound interest work

7. Ignore valuation - overpay for assets in bubbles
   → Avoid: Maintain discipline on price; wait for margin of safety

8. Follow the crowd into crowded trades
   → Avoid: Be contrarian when everyone is euphoric or despairing

Munger's insight: "It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent."

By systematically avoiding the ways to fail, you don't need to be a genius picker of winners. You survive long enough for compounding to work its magic.

Application to your life:
Want a successful career? Invert: How do I guarantee career failure?
- Burn bridges and make enemies
- Never learn new skills or adapt
- Be unreliable and miss deadlines
- Take credit for others' work

Now avoid those things. You don't need to be the most talented person - just be reliable, keep learning, treat people well, and give credit where due. You'll outlast 90% of competition.`,
    },
    relatedModels: ['pre_mortem', 'second_order_effects', 'first_principles'],
    toolParameters: {
      modelName: 'inversion_thinking',
      problem: 'Your goal or decision',
      steps: ['Invert the problem', 'List failure modes', 'Identify avoidance strategies'],
    },
  },
  second_order_effects: {
    name: 'second_order_effects',
    title: 'Second-Order Effects',
    description: 'Think beyond immediate consequences to understand the chain of effects - what happens after what happens. Consider how actions ripple through systems.',
    whenToUse: [
      'When making policy decisions or strategic changes with broad impact',
      'When evaluating solutions that might have unintended consequences',
      'When thinking through complex systems with interconnected parts',
      'When the obvious first-order solution might create worse problems',
      'When you need to anticipate long-term ripple effects of decisions',
    ],
    steps: [
      'Identify the action or decision being considered (the intervention)',
      'Map First-Order Effects: What are the immediate, direct consequences? These are usually obvious and intended.',
      'Map Second-Order Effects: What are the consequences of those consequences? How will people and systems react to the first-order changes?',
      'Map Third-Order Effects (and beyond): Continue the chain - what happens as the ripples spread further through the system?',
      'Identify feedback loops: Do any effects amplify or dampen each other? Are there reinforcing cycles or balancing mechanisms?',
      'Evaluate net impact: Consider the full cascade, not just the initial effect. Are second/third-order effects better or worse than the problem you\'re solving?',
    ],
    example: {
      context: 'A city government considering rent control to make housing affordable',
      application: `Problem: Rising rents are making the city unaffordable for middle-class families.

Proposed Solution: Implement rent control - cap annual rent increases at 3%.

First-Order Effects (immediate, obvious):
✓ Existing tenants save money - rents increase more slowly
✓ Renters have more predictable housing costs
✓ Political win - constituents happy with immediate relief

Second-Order Effects (consequences of consequences):
⚠ Landlords reduce property maintenance (lower ROI means less reinvestment)
⚠ New apartment construction drops sharply (developers can't justify investment with capped returns)
⚠ Landlords convert rentals to condos or short-term vacation rentals to escape rent control
⚠ Fewer people move (giving up a rent-controlled unit is too costly), reducing labor mobility
⚠ Black market emerges: "key money" under-the-table payments to get rent-controlled units
⚠ Screening becomes more aggressive - landlords only accept "perfect" tenants, discriminating against risky applicants

Third-Order Effects (ripple effects continue):
❌ Housing supply shrinks over 5-10 years (construction down, conversions up)
❌ Housing shortage intensifies, making it harder for newcomers to find ANY apartment
❌ Prices for non-controlled units skyrocket (limited supply, high demand)
❌ The city becomes MORE unaffordable for anyone not already in a rent-controlled unit
❌ Economic growth slows as workers can't relocate to the city for new jobs
❌ Inequality increases: Those with rent-controlled apartments (incumbents) vs. those without (newcomers)

System-Level Insight:
The first-order effect (lower rent increases) solves the immediate problem for current tenants. But second and third-order effects create a worse version of the original problem: less housing supply, higher prices for new renters, reduced mobility, and entrenched inequality.

Real-world evidence: This exact pattern has played out in San Francisco, New York, and Stockholm, where rent control led to housing shortages, reduced construction, and paradoxically higher market-rate rents.

Alternative approach considering second-order effects:
Instead of rent control (which reduces supply), increase supply through:
- Upzoning and reducing building restrictions
- Streamlining permit processes
- Incentivizing mixed-income developments

These interventions have positive second-order effects: more construction → more housing supply → lower prices through market forces → more people can afford to live in the city.

Key lesson: Always ask "And then what happens?" The most obvious solution often triggers reactions that undermine the original goal. Systems push back.`,
    },
    relatedModels: ['inversion_thinking', 'swot_analysis', 'pre_mortem'],
    toolParameters: {
      modelName: 'second_order_effects',
      problem: 'Your decision or policy requiring consequence analysis',
      steps: ['First-order effects', 'Second-order effects', 'Third-order effects', 'Feedback loops', 'Net impact evaluation'],
    },
  },
};

/**
 * Extended model type definition
 */
interface ExtendedModel {
  name: string;
  title: string;
  description: string;
  whenToUse: string[];
  steps: string[];
  example: {
    context: string;
    application: string;
  };
  relatedModels: string[];
  toolParameters: {
    modelName: string;
    problem: string;
    steps: string[];
  };
}

/**
 * Get a specific model's extended details
 */
export function getExtendedModel(modelName: string): ExtendedModel | null {
  return EXTENDED_MODELS[modelName] || null;
}

/**
 * Get all available extended model names
 */
export function getExtendedModelNames(): string[] {
  return Object.keys(EXTENDED_MODELS);
}

/**
 * Handle resource read for extended models
 * URI format: think://models/{model_name}
 */
export async function handleExtendedModelRead(uri: URL): Promise<ReadResourceResult> {
  const modelName = uri.pathname.replace(/^\//, '');
  const model = getExtendedModel(modelName);

  if (!model) {
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({
            error: 'Model not found',
            availableModels: getExtendedModelNames(),
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
        text: JSON.stringify(model, null, 2),
      },
    ],
  };
}
