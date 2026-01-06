import { describe, it, expect, beforeEach } from 'vitest';
import { ModelServer } from './modelServer.js';

describe('ModelServer', () => {
  let server: ModelServer;

  beforeEach(() => {
    server = new ModelServer();
  });

  it('should process valid mental model data', () => {
    const result = server.processModel({
      modelName: 'first_principles',
      problem: 'Why is the application slow?',
      steps: ['Identify assumptions', 'Break down components'],
      reasoning: 'Starting from fundamentals',
      conclusion: 'Database queries are the bottleneck',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('first_principles');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should return failed status for missing modelName', () => {
    const result = server.processModel({
      problem: 'test problem',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for missing problem', () => {
    const result = server.processModel({
      modelName: 'first_principles',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle optional fields', () => {
    const result = server.processModel({
      modelName: 'pareto_principle',
      problem: 'Where should we focus efforts?',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('pareto_principle');
    expect(result.hasSteps).toBe(false);
    expect(result.hasConclusion).toBe(false);
  });

  it('should process SWOT Analysis model with strategic scenario', () => {
    const result = server.processModel({
      modelName: 'swot_analysis',
      problem: 'Should our coffee shop expand delivery services?',
      steps: [
        'Strengths: Loyal customer base, high-quality coffee, strong social media presence',
        'Weaknesses: Limited capital, no delivery infrastructure, small team',
        'Opportunities: Growing delivery market, new residential developments nearby',
        'Threats: Chain competitors with aggressive promotions, high delivery fees',
      ],
      reasoning: 'Partner with local delivery co-op to leverage strengths while avoiding cash-intensive competition',
      conclusion: 'Launch premium subscription delivery service focusing on scheduled morning deliveries',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('swot_analysis');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process Six Thinking Hats model with perspective analysis', () => {
    const result = server.processModel({
      modelName: 'six_thinking_hats',
      problem: 'Should we add AI chatbot support to our SaaS app?',
      steps: [
        'White Hat: 1,200 tickets/month, 40% repetitive, $50K implementation cost',
        'Red Hat: Team excited but anxious about losing personal touch',
        'Black Hat: 30-40% queries need humans, risk of poor UX damaging brand',
        'Yellow Hat: 24/7 availability, instant responses, scalable support',
        'Green Hat: Hybrid approach with seamless handoff, A/B test with pilot',
        'Blue Hat: Proceed with 3-month hybrid pilot, measure satisfaction and efficiency',
      ],
      reasoning: 'Multiple perspectives reveal risks and opportunities for hybrid approach',
      conclusion: 'Launch pilot balancing automation benefits with quality concerns',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('six_thinking_hats');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process MECE model with structured problem breakdown', () => {
    const result = server.processModel({
      modelName: 'mece',
      problem: 'Why did revenue decline 15% year-over-year?',
      steps: [
        'Revenue = Customers × Transaction Value × Purchase Frequency',
        'Customer count: Down 12% (reduced digital ad spending)',
        'Transaction value: Down 8% (smaller basket sizes, product mix shift)',
        'Purchase frequency: Flat (no change)',
        'Combined effect: ~15% decline explained',
      ],
      reasoning: 'MECE framework ensures all revenue components covered without overlap',
      conclusion: 'Focus on customer acquisition and basket size optimization',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('mece');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process Inversion Thinking model with failure avoidance', () => {
    const result = server.processModel({
      modelName: 'inversion_thinking',
      problem: 'How to build a successful investment portfolio?',
      steps: [
        'Invert: How to guarantee investment failure?',
        'Chase hot tips without understanding businesses',
        'Use excessive leverage and borrowed money',
        'Panic sell during downturns',
        'Pay high fees and trade frequently',
        'Fail to diversify',
      ],
      reasoning: 'Avoid stupid mistakes rather than trying to be brilliant',
      conclusion: 'Never invest in what you don\'t understand, minimize fees, maintain discipline',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('inversion_thinking');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process Second-Order Effects model with consequence analysis', () => {
    const result = server.processModel({
      modelName: 'second_order_effects',
      problem: 'Should the city implement rent control to make housing affordable?',
      steps: [
        'First-order: Existing tenants save money, rents increase slowly',
        'Second-order: Landlords reduce maintenance, construction drops, conversions to condos increase',
        'Third-order: Housing supply shrinks, prices for non-controlled units skyrocket',
        'System impact: City becomes MORE unaffordable for newcomers',
      ],
      reasoning: 'Solution creates worse version of original problem through cascading effects',
      conclusion: 'Instead focus on increasing supply through upzoning and reduced restrictions',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('second_order_effects');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process Pre-Mortem model with prospective failure analysis', () => {
    const result = server.processModel({
      modelName: 'pre_mortem',
      problem: 'Mobile app marketplace launch',
      steps: [
        'Imagine: 6 months from now, launch was complete disaster',
        'Failure: Only 12 vendors instead of 100, users found nothing to buy',
        'Failure: Payment processing took 4 months not 4 weeks, launched broken',
        'Failure: Customer acquisition cost $45 but LTV only $12',
        'Failure: No money transmitter licenses, forced shutdown in major markets',
      ],
      reasoning: 'Prospective hindsight reveals hidden risks team hesitant to voice',
      conclusion: 'Delay launch 3 months, recruit vendors early, hire payments specialist',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('pre_mortem');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process Five Whys model with root cause analysis', () => {
    const result = server.processModel({
      modelName: 'five_whys',
      problem: 'Robot welding machine stopped working on assembly line',
      steps: [
        'Why #1: Circuit overloaded and fuse blew',
        'Why #2: Bearings not sufficiently lubricated, causing excessive friction',
        'Why #3: Lubrication pump not circulating enough oil',
        'Why #4: Pump intake clogged with metal shavings',
        'Why #5: No filter on pump, shavings contaminate oil system',
      ],
      reasoning: 'Each "why" peels back a layer from symptom to root cause',
      conclusion: 'Install filter on pump intake and implement maintenance checklist',
    });

    expect(result.status).toBe('success');
    expect(result.modelName).toBe('five_whys');
    expect(result.hasSteps).toBe(true);
    expect(result.hasConclusion).toBe(true);
  });

  it('should process all mental model types', () => {
    const models = [
      'first_principles',
      'opportunity_cost',
      'error_propagation',
      'rubber_duck',
      'pareto_principle',
      'occams_razor',
      'swot_analysis',
      'six_thinking_hats',
      'mece',
      'inversion_thinking',
      'second_order_effects',
      'pre_mortem',
      'five_whys',
    ];

    models.forEach(modelName => {
      const result = server.processModel({
        modelName,
        problem: 'Test problem',
      });
      expect(result.status).toBe('success');
      expect(result.modelName).toBe(modelName);
    });
  });
});
