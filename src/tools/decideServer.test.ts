import { describe, it, expect, beforeEach } from 'vitest';
import { DecideServer } from './decideServer.js';

describe('DecideServer', () => {
  let server: DecideServer;

  beforeEach(() => {
    server = new DecideServer();
  });

  const validInput = {
    decisionStatement: 'Which database should we use?',
    options: [
      { id: 'pg', name: 'PostgreSQL', description: 'Relational database' },
      { id: 'mongo', name: 'MongoDB', description: 'Document database' },
    ],
    analysisType: 'weighted-criteria' as const,
    stage: 'evaluation' as const,
    decisionId: 'db-decision-1',
    iteration: 0,
    nextStageNeeded: true,
  };

  it('should process valid decision framework data', () => {
    const result = server.processDecisionFramework(validInput);

    expect(result.status).toBe('success');
    expect(result.data?.decisionStatement).toBe('Which database should we use?');
    expect(result.data?.analysisType).toBe('weighted-criteria');
    expect(result.data?.optionCount).toBe(2);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processDecisionFramework({
      decisionStatement: 'test',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processDecisionFramework({
      ...validInput,
      iteration: -1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid nextStageNeeded type', () => {
    const result = server.processDecisionFramework({
      ...validInput,
      nextStageNeeded: 'yes',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle all analysis types', () => {
    const types = [
      'pros-cons',
      'weighted-criteria',
      'decision-tree',
      'expected-value',
      'scenario-analysis',
    ] as const;

    types.forEach(analysisType => {
      const result = server.processDecisionFramework({
        ...validInput,
        analysisType,
      });
      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe(analysisType);
    });
  });

  it('should handle all stage types', () => {
    const stages = [
      'problem-definition',
      'options-generation',
      'criteria-definition',
      'evaluation',
      'sensitivity-analysis',
      'decision',
    ] as const;

    stages.forEach(stage => {
      const result = server.processDecisionFramework({
        ...validInput,
        stage,
      });
      expect(result.status).toBe('success');
      expect(result.data?.stage).toBe(stage);
    });
  });

  describe('Eisenhower Matrix', () => {
    const eisenhowerInput = {
      decisionStatement: 'How should I prioritize my tasks today?',
      options: [
        { id: 'task1', name: 'Fix production bug', description: 'Critical issue affecting users' },
        { id: 'task2', name: 'Strategic planning', description: 'Long-term roadmap development' },
        { id: 'task3', name: 'Reply to emails', description: 'Routine correspondence' },
        { id: 'task4', name: 'Social media browsing', description: 'Non-work related activity' },
      ],
      analysisType: 'eisenhower-matrix' as const,
      stage: 'evaluation' as const,
      decisionId: 'task-priority-1',
      iteration: 0,
      nextStageNeeded: true,
      eisenhowerClassification: [
        { optionId: 'task1', urgency: 5, importance: 5, quadrant: 'do-first' as const },
        { optionId: 'task2', urgency: 2, importance: 5, quadrant: 'schedule' as const },
        { optionId: 'task3', urgency: 4, importance: 2, quadrant: 'delegate' as const },
        { optionId: 'task4', urgency: 1, importance: 1, quadrant: 'eliminate' as const },
      ],
    };

    it('should classify tasks into all 4 quadrants correctly', () => {
      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(eisenhowerInput);

      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe('eisenhower-matrix');
      expect(result.data?.optionCount).toBe(4);
      expect(output).toContain('Eisenhower Matrix Analysis');
      expect(output).toContain('DO FIRST');
      expect(output).toContain('SCHEDULE');
      expect(output).toContain('DELEGATE');
      expect(output).toContain('ELIMINATE');
      expect(output).toContain('Fix production bug');
      expect(output).toContain('Strategic planning');
      expect(output).toContain('Reply to emails');
      expect(output).toContain('Social media browsing');
    });

    it('should handle tasks with only Do First quadrant items', () => {
      const crisisInput = {
        decisionStatement: 'What are my urgent and important tasks?',
        options: [
          { id: 'crisis1', name: 'Server outage', description: 'System down, users affected' },
          { id: 'crisis2', name: 'Security breach', description: 'Immediate security threat' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'crisis-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 'crisis1', urgency: 5, importance: 5, quadrant: 'do-first' as const },
          { optionId: 'crisis2', urgency: 5, importance: 5, quadrant: 'do-first' as const },
        ],
      };

      const result = server.processDecisionFramework(crisisInput);
      const output = server.formatOutput(crisisInput);

      expect(result.status).toBe('success');
      expect(output).toContain('Server outage');
      expect(output).toContain('Security breach');
      expect(output).toContain('No items in this quadrant');
      expect(output.match(/No items in this quadrant/g)).toHaveLength(3);
    });

    it('should handle tasks in Schedule quadrant for strategic work', () => {
      const strategicInput = {
        decisionStatement: 'What should I schedule for later?',
        options: [
          { id: 'strat1', name: 'Quarterly OKRs', description: 'Set team objectives' },
          { id: 'strat2', name: 'Team development', description: 'Training and mentoring' },
          { id: 'strat3', name: 'Process improvement', description: 'Optimize workflows' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'strategic-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 'strat1', urgency: 2, importance: 5, quadrant: 'schedule' as const },
          { optionId: 'strat2', urgency: 1, importance: 4, quadrant: 'schedule' as const },
          { optionId: 'strat3', urgency: 2, importance: 4, quadrant: 'schedule' as const },
        ],
      };

      const result = server.processDecisionFramework(strategicInput);
      const output = server.formatOutput(strategicInput);

      expect(result.status).toBe('success');
      expect(output).toContain('SCHEDULE');
      expect(output).toContain('Quarterly OKRs');
      expect(output).toContain('Team development');
      expect(output).toContain('Process improvement');
      expect(output).toContain('Urgency: 2/5');
      expect(output).toContain('Importance: 5/5');
    });

    it('should handle tasks in Delegate quadrant for urgent but less important work', () => {
      const delegateInput = {
        decisionStatement: 'What tasks can I delegate?',
        options: [
          { id: 'admin1', name: 'Schedule meetings', description: 'Coordinate team calendars' },
          { id: 'admin2', name: 'Update documentation', description: 'Minor doc corrections' },
          { id: 'admin3', name: 'Respond to routine requests', description: 'Standard inquiries' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'delegate-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 'admin1', urgency: 4, importance: 2, quadrant: 'delegate' as const },
          { optionId: 'admin2', urgency: 3, importance: 2, quadrant: 'delegate' as const },
          { optionId: 'admin3', urgency: 4, importance: 1, quadrant: 'delegate' as const },
        ],
      };

      const result = server.processDecisionFramework(delegateInput);
      const output = server.formatOutput(delegateInput);

      expect(result.status).toBe('success');
      expect(output).toContain('DELEGATE');
      expect(output).toContain('Schedule meetings');
      expect(output).toContain('Update documentation');
      expect(output).toContain('Respond to routine requests');
    });

    it('should handle tasks in Eliminate quadrant for time wasters', () => {
      const eliminateInput = {
        decisionStatement: 'What tasks should I eliminate?',
        options: [
          { id: 'waste1', name: 'Excessive meetings', description: 'Low-value status updates' },
          { id: 'waste2', name: 'Perfectionism on minor details', description: 'Over-optimizing trivial things' },
          { id: 'waste3', name: 'Distracting activities', description: 'Time-consuming non-work' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'eliminate-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 'waste1', urgency: 1, importance: 1, quadrant: 'eliminate' as const },
          { optionId: 'waste2', urgency: 2, importance: 1, quadrant: 'eliminate' as const },
          { optionId: 'waste3', urgency: 1, importance: 1, quadrant: 'eliminate' as const },
        ],
      };

      const result = server.processDecisionFramework(eliminateInput);
      const output = server.formatOutput(eliminateInput);

      expect(result.status).toBe('success');
      expect(output).toContain('ELIMINATE');
      expect(output).toContain('Excessive meetings');
      expect(output).toContain('Perfectionism on minor details');
      expect(output).toContain('Distracting activities');
    });

    it('should handle empty eisenhowerClassification array', () => {
      const emptyInput = {
        decisionStatement: 'No tasks to classify',
        options: [
          { id: 't1', name: 'Task A', description: 'Description A' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'empty-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [],
      };

      const result = server.processDecisionFramework(emptyInput);
      const output = server.formatOutput(emptyInput);

      expect(result.status).toBe('success');
      expect(output).toBe('');
    });
  });

  describe('Cost-Benefit Analysis', () => {
    const costBenefitInput = {
      decisionStatement: 'Should we migrate to the cloud?',
      options: [
        { id: 'migrate', name: 'Cloud Migration', description: 'Move to AWS' },
        { id: 'stay', name: 'Stay On-Premise', description: 'Keep current infrastructure' },
      ],
      analysisType: 'cost-benefit' as const,
      stage: 'evaluation' as const,
      decisionId: 'cloud-decision-1',
      iteration: 0,
      nextStageNeeded: true,
      costBenefitAnalysis: [
        {
          optionId: 'migrate',
          costs: [
            { optionId: 'migrate', description: 'Migration labor', amount: 50000, type: 'monetary' as const },
            { optionId: 'migrate', description: 'Downtime', amount: 10000, type: 'monetary' as const },
          ],
          benefits: [
            { optionId: 'migrate', description: 'Reduced ops cost', amount: 30000, type: 'monetary' as const },
            { optionId: 'migrate', description: 'Scalability', amount: 20000, type: 'monetary' as const },
          ],
          netValue: -10000,
          benefitCostRatio: 0.83,
          roi: -16.67,
        },
      ],
    };

    it('should process cost-benefit analysis', () => {
      const result = server.processDecisionFramework(costBenefitInput);
      const output = server.formatOutput(costBenefitInput);

      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe('cost-benefit');
      expect(output).toContain('Cost-Benefit Analysis');
      expect(output).toContain('Cloud Migration');
    });
  });

  describe('Risk Assessment', () => {
    const riskInput = {
      decisionStatement: 'Which vendor should we choose?',
      options: [
        { id: 'vendor-a', name: 'Vendor A', description: 'Established vendor' },
        { id: 'vendor-b', name: 'Vendor B', description: 'New vendor' },
      ],
      analysisType: 'risk-assessment' as const,
      stage: 'evaluation' as const,
      decisionId: 'vendor-decision-1',
      iteration: 0,
      nextStageNeeded: true,
      riskAssessment: [
        {
          optionId: 'vendor-a',
          description: 'Vendor lock-in',
          probability: 3,
          impact: 4,
          riskScore: 12,
          category: 'Strategic',
          mitigation: ['Negotiate exit clauses', 'Build abstraction layer'],
        },
      ],
    };

    it('should process risk assessment', () => {
      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(riskInput);

      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe('risk-assessment');
      expect(output).toContain('Risk Assessment');
      expect(output).toContain('Vendor lock-in');
    });
  });

  describe('Reversibility Analysis', () => {
    const reversibilityInput = {
      decisionStatement: 'Should we commit to this architecture?',
      options: [
        { id: 'monolith', name: 'Monolith', description: 'Single application' },
        { id: 'microservices', name: 'Microservices', description: 'Distributed services' },
      ],
      analysisType: 'reversibility' as const,
      stage: 'evaluation' as const,
      decisionId: 'arch-decision-1',
      iteration: 0,
      nextStageNeeded: true,
      reversibilityAnalysis: [
        {
          optionId: 'monolith',
          reversibilityScore: 4,
          undoCost: 50000,
          timeToReverse: 6,
          doorType: 'two-way' as const,
          undoComplexity: 'Medium',
          reversibilityNotes: 'Can be decomposed later',
        },
        {
          optionId: 'microservices',
          reversibilityScore: 2,
          undoCost: 150000,
          timeToReverse: 12,
          doorType: 'one-way' as const,
          undoComplexity: 'High',
          reversibilityNotes: 'Difficult to consolidate once distributed',
        },
      ],
    };

    it('should process reversibility analysis', () => {
      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(reversibilityInput);

      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe('reversibility');
      expect(output).toContain('Reversibility Analysis');
      expect(output).toContain('Monolith');
      expect(output).toContain('Microservices');
    });
  });

  describe('Regret Minimization', () => {
    const regretInput = {
      decisionStatement: 'Should I take this job offer?',
      options: [
        { id: 'stay', name: 'Stay at Current Job', description: 'Stable position' },
        { id: 'new-job', name: 'Accept New Offer', description: 'Exciting opportunity' },
      ],
      analysisType: 'regret-minimization' as const,
      stage: 'evaluation' as const,
      decisionId: 'career-decision-1',
      iteration: 0,
      nextStageNeeded: true,
      regretMinimizationAnalysis: [
        {
          optionId: 'stay',
          futureSelfPerspective: 'Safe but potentially limiting',
          potentialRegrets: {
            tenMinutes: 'Relief from avoiding change',
            tenMonths: 'Wonder about missed growth',
            tenYears: 'Possible regret about not taking risks',
          },
          regretScore: 6,
        },
        {
          optionId: 'new-job',
          futureSelfPerspective: 'Challenging but potentially rewarding',
          potentialRegrets: {
            tenMinutes: 'Anxiety about change',
            tenMonths: 'Adjustment challenges',
            tenYears: 'Pride in taking the leap',
          },
          regretScore: 3,
        },
      ],
    };

    it('should process regret minimization analysis', () => {
      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(regretInput);

      expect(result.status).toBe('success');
      expect(result.data?.analysisType).toBe('regret-minimization');
      expect(output).toContain('Regret Minimization Analysis');
      expect(output).toContain('Stay at Current Job');
      expect(output).toContain('Accept New Offer');
    });
  });
});
