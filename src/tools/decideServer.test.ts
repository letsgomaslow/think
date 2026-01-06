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

    expect(result.decisionStatement).toBe('Which database should we use?');
    expect(result.analysisType).toBe('weighted-criteria');
    expect(result.options).toHaveLength(2);
  });

  it('should reject missing required fields', () => {
    expect(() => server.processDecisionFramework({
      decisionStatement: 'test',
    })).toThrow();
  });

  it('should reject invalid iteration', () => {
    expect(() => server.processDecisionFramework({
      ...validInput,
      iteration: -1,
    })).toThrow();
  });

  it('should reject invalid nextStageNeeded type', () => {
    expect(() => server.processDecisionFramework({
      ...validInput,
      nextStageNeeded: 'yes',
    })).toThrow();
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
      expect(result.analysisType).toBe(analysisType);
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
      expect(result.stage).toBe(stage);
    });
  });

  describe('Eisenhower Matrix', () => {
    it('should classify tasks into all 4 quadrants correctly', () => {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(result.analysisType).toBe('eisenhower-matrix');
      expect(result.eisenhowerClassification).toHaveLength(4);
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
      const eisenhowerInput = {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Server outage');
      expect(output).toContain('Security breach');
      expect(output).toContain('No items in this quadrant');
      expect(output.match(/No items in this quadrant/g)).toHaveLength(3);
    });

    it('should handle tasks in Schedule quadrant for strategic work', () => {
      const eisenhowerInput = {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(output).toContain('SCHEDULE');
      expect(output).toContain('Quarterly OKRs');
      expect(output).toContain('Team development');
      expect(output).toContain('Process improvement');
      expect(output).toContain('Urgency: 2/5');
      expect(output).toContain('Importance: 5/5');
    });

    it('should handle tasks in Delegate quadrant for urgent but less important work', () => {
      const eisenhowerInput = {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(output).toContain('DELEGATE');
      expect(output).toContain('Schedule meetings');
      expect(output).toContain('Update documentation');
      expect(output).toContain('Respond to routine requests');
    });

    it('should handle tasks in Eliminate quadrant for time wasters', () => {
      const eisenhowerInput = {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(output).toContain('ELIMINATE');
      expect(output).toContain('Excessive meetings');
      expect(output).toContain('Perfectionism on minor details');
      expect(output).toContain('Distracting activities');
    });

    it('should handle edge case with varying urgency and importance scores', () => {
      const eisenhowerInput = {
        decisionStatement: 'Mixed priority tasks',
        options: [
          { id: 't1', name: 'Task A', description: 'High urgency, high importance' },
          { id: 't2', name: 'Task B', description: 'Medium urgency, high importance' },
          { id: 't3', name: 'Task C', description: 'High urgency, low importance' },
          { id: 't4', name: 'Task D', description: 'Low urgency, low importance' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'mixed-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 't1', urgency: 5, importance: 4, quadrant: 'do-first' as const },
          { optionId: 't2', urgency: 3, importance: 5, quadrant: 'schedule' as const },
          { optionId: 't3', urgency: 5, importance: 2, quadrant: 'delegate' as const },
          { optionId: 't4', urgency: 2, importance: 2, quadrant: 'eliminate' as const },
        ],
      };

      const result = server.processDecisionFramework(eisenhowerInput);

      expect(result.eisenhowerClassification).toBeDefined();
      expect(result.eisenhowerClassification![0].urgency).toBe(5);
      expect(result.eisenhowerClassification![0].importance).toBe(4);
      expect(result.eisenhowerClassification![1].quadrant).toBe('schedule');
      expect(result.eisenhowerClassification![2].quadrant).toBe('delegate');
      expect(result.eisenhowerClassification![3].quadrant).toBe('eliminate');
    });

    it('should handle empty eisenhowerClassification array', () => {
      const eisenhowerInput = {
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

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      expect(result.eisenhowerClassification).toHaveLength(0);
      expect(output).toBe('');
    });

    it('should verify quadrant display order: Do First, Schedule, Delegate, Eliminate', () => {
      const eisenhowerInput = {
        decisionStatement: 'Verify quadrant order',
        options: [
          { id: 'e', name: 'Eliminate task', description: 'Should appear last' },
          { id: 'd', name: 'Delegate task', description: 'Should appear third' },
          { id: 's', name: 'Schedule task', description: 'Should appear second' },
          { id: 'f', name: 'Do First task', description: 'Should appear first' },
        ],
        analysisType: 'eisenhower-matrix' as const,
        stage: 'evaluation' as const,
        decisionId: 'order-tasks-1',
        iteration: 0,
        nextStageNeeded: true,
        eisenhowerClassification: [
          { optionId: 'e', urgency: 1, importance: 1, quadrant: 'eliminate' as const },
          { optionId: 'd', urgency: 4, importance: 2, quadrant: 'delegate' as const },
          { optionId: 's', urgency: 2, importance: 5, quadrant: 'schedule' as const },
          { optionId: 'f', urgency: 5, importance: 5, quadrant: 'do-first' as const },
        ],
      };

      const result = server.processDecisionFramework(eisenhowerInput);
      const output = server.formatOutput(result);

      const doFirstIndex = output.indexOf('DO FIRST');
      const scheduleIndex = output.indexOf('SCHEDULE');
      const delegateIndex = output.indexOf('DELEGATE');
      const eliminateIndex = output.indexOf('ELIMINATE');

      expect(doFirstIndex).toBeLessThan(scheduleIndex);
      expect(scheduleIndex).toBeLessThan(delegateIndex);
      expect(delegateIndex).toBeLessThan(eliminateIndex);
    });
  });

  describe('Cost-Benefit Analysis', () => {
    it('should calculate costs, benefits, and net value correctly', () => {
      const cbaInput = {
        decisionStatement: 'Should we migrate to cloud infrastructure?',
        options: [
          { id: 'cloud', name: 'Migrate to Cloud', description: 'Move infrastructure to AWS/Azure' },
          { id: 'onprem', name: 'Keep On-Premise', description: 'Maintain current infrastructure' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'cloud-migration-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'cloud',
            costs: [
              { optionId: 'cloud', description: 'Migration costs', amount: 50000, type: 'monetary' as const, category: 'Setup', timeframe: 'Year 1' },
              { optionId: 'cloud', description: 'Monthly hosting', amount: 120000, type: 'monetary' as const, category: 'Operating', timeframe: 'Years 1-3' },
              { optionId: 'cloud', description: 'Training time', amount: 10000, type: 'non-monetary' as const, category: 'Learning', timeframe: 'Year 1' },
            ],
            benefits: [
              { optionId: 'cloud', description: 'Reduced maintenance', amount: 80000, type: 'monetary' as const, category: 'Savings', timeframe: 'Years 1-3' },
              { optionId: 'cloud', description: 'Scalability', amount: 100000, type: 'monetary' as const, category: 'Revenue', timeframe: 'Years 2-3' },
              { optionId: 'cloud', description: 'Developer productivity', amount: 40000, type: 'non-monetary' as const, category: 'Efficiency', timeframe: 'Years 1-3' },
            ],
            netValue: 40000,
            benefitCostRatio: 1.22,
            roi: 22.2,
          },
          {
            optionId: 'onprem',
            costs: [
              { optionId: 'onprem', description: 'Hardware maintenance', amount: 60000, type: 'monetary' as const, category: 'Operating', timeframe: 'Years 1-3' },
              { optionId: 'onprem', description: 'Staff time', amount: 80000, type: 'monetary' as const, category: 'Operating', timeframe: 'Years 1-3' },
            ],
            benefits: [
              { optionId: 'onprem', description: 'Data control', amount: 30000, type: 'non-monetary' as const, category: 'Security', timeframe: 'Years 1-3' },
            ],
            netValue: -110000,
            benefitCostRatio: 0.21,
            roi: -78.6,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(result.analysisType).toBe('cost-benefit');
      expect(result.costBenefitAnalysis).toHaveLength(2);
      expect(result.costBenefitAnalysis![0].netValue).toBe(40000);
      expect(result.costBenefitAnalysis![0].benefitCostRatio).toBe(1.22);
      expect(result.costBenefitAnalysis![0].roi).toBe(22.2);
      expect(output).toContain('Cost-Benefit Analysis');
      expect(output).toContain('Migrate to Cloud');
      expect(output).toContain('Migration costs');
      expect(output).toContain('Reduced maintenance');
      expect(output).toContain('Net Value');
      expect(output).toContain('Benefit-Cost Ratio');
      expect(output).toContain('ROI');
    });

    it('should calculate and display NPV with discount rate correctly', () => {
      const cbaInput = {
        decisionStatement: 'Should we invest in automated testing infrastructure?',
        options: [
          { id: 'autotest', name: 'Automated Testing', description: 'Implement comprehensive test automation' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'test-automation-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'autotest',
            costs: [
              { optionId: 'autotest', description: 'Initial setup', amount: 100000, type: 'monetary' as const, category: 'Setup', timeframe: 'Year 0' },
              { optionId: 'autotest', description: 'Maintenance', amount: 20000, type: 'monetary' as const, category: 'Operating', timeframe: 'Per Year' },
            ],
            benefits: [
              { optionId: 'autotest', description: 'Reduced bug fixes', amount: 80000, type: 'monetary' as const, category: 'Savings', timeframe: 'Per Year' },
              { optionId: 'autotest', description: 'Faster releases', amount: 60000, type: 'monetary' as const, category: 'Revenue', timeframe: 'Per Year' },
            ],
            netValue: 120000,
            benefitCostRatio: 1.86,
            roi: 85.7,
            discountRate: 0.08,
            timePeriodYears: 3,
            npv: 205847,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(result.costBenefitAnalysis![0].npv).toBe(205847);
      expect(result.costBenefitAnalysis![0].discountRate).toBe(0.08);
      expect(result.costBenefitAnalysis![0].timePeriodYears).toBe(3);
      expect(output).toContain('NPV');
      expect(output).toContain('$205,847');
      expect(output).toContain('8%');
      expect(output).toContain('3 years');
    });

    it('should handle monetary and non-monetary items separately', () => {
      const cbaInput = {
        decisionStatement: 'Should we implement remote work policy?',
        options: [
          { id: 'remote', name: 'Remote Work', description: 'Allow full remote work' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'remote-work-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'remote',
            costs: [
              { optionId: 'remote', description: 'Home office stipends', amount: 50000, type: 'monetary' as const },
              { optionId: 'remote', description: 'Communication overhead', amount: 20000, type: 'non-monetary' as const },
              { optionId: 'remote', description: 'Collaboration tools', amount: 30000, type: 'monetary' as const },
            ],
            benefits: [
              { optionId: 'remote', description: 'Office space savings', amount: 200000, type: 'monetary' as const },
              { optionId: 'remote', description: 'Employee satisfaction', amount: 80000, type: 'non-monetary' as const },
              { optionId: 'remote', description: 'Recruitment advantage', amount: 60000, type: 'non-monetary' as const },
              { optionId: 'remote', description: 'Reduced commute costs', amount: 40000, type: 'monetary' as const },
            ],
            netValue: 160000,
            benefitCostRatio: 3.8,
            roi: 280,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      // Check that monetary and non-monetary items are displayed
      expect(output).toContain('💵');  // monetary emoji
      expect(output).toContain('⚖️');  // non-monetary emoji
      expect(output).toContain('Home office stipends');
      expect(output).toContain('Communication overhead');
      expect(output).toContain('Employee satisfaction');
      expect(output).toContain('Office space savings');
    });

    it('should display cost and benefit categories when provided', () => {
      const cbaInput = {
        decisionStatement: 'Should we upgrade our development tools?',
        options: [
          { id: 'upgrade', name: 'Upgrade Tools', description: 'Purchase premium development tools' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'tool-upgrade-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'upgrade',
            costs: [
              { optionId: 'upgrade', description: 'License fees', amount: 10000, type: 'monetary' as const, category: 'Software' },
              { optionId: 'upgrade', description: 'Training', amount: 5000, type: 'monetary' as const, category: 'Education' },
            ],
            benefits: [
              { optionId: 'upgrade', description: 'Faster development', amount: 30000, type: 'monetary' as const, category: 'Productivity' },
              { optionId: 'upgrade', description: 'Better debugging', amount: 15000, type: 'monetary' as const, category: 'Quality' },
            ],
            netValue: 30000,
            benefitCostRatio: 3.0,
            roi: 200,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Software');
      expect(output).toContain('Education');
      expect(output).toContain('Productivity');
      expect(output).toContain('Quality');
    });

    it('should display timeframes when provided', () => {
      const cbaInput = {
        decisionStatement: 'Should we invest in AI/ML capabilities?',
        options: [
          { id: 'ai', name: 'AI Investment', description: 'Build ML infrastructure' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'ai-invest-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'ai',
            costs: [
              { optionId: 'ai', description: 'Infrastructure', amount: 150000, type: 'monetary' as const, timeframe: 'Q1 2024' },
              { optionId: 'ai', description: 'Hiring ML engineers', amount: 300000, type: 'monetary' as const, timeframe: 'Q1-Q2 2024' },
            ],
            benefits: [
              { optionId: 'ai', description: 'Automated insights', amount: 200000, type: 'monetary' as const, timeframe: 'Q3-Q4 2024' },
              { optionId: 'ai', description: 'Competitive advantage', amount: 500000, type: 'monetary' as const, timeframe: '2025-2026' },
            ],
            netValue: 250000,
            benefitCostRatio: 1.56,
            roi: 55.6,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Q1 2024');
      expect(output).toContain('Q1-Q2 2024');
      expect(output).toContain('Q3-Q4 2024');
      expect(output).toContain('2025-2026');
    });

    it('should handle negative net value correctly', () => {
      const cbaInput = {
        decisionStatement: 'Should we pursue this unprofitable project?',
        options: [
          { id: 'proj', name: 'Unprofitable Project', description: 'High cost, low return' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'bad-project-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'proj',
            costs: [
              { optionId: 'proj', description: 'Development', amount: 500000, type: 'monetary' as const },
              { optionId: 'proj', description: 'Marketing', amount: 200000, type: 'monetary' as const },
            ],
            benefits: [
              { optionId: 'proj', description: 'Revenue', amount: 100000, type: 'monetary' as const },
              { optionId: 'proj', description: 'Brand awareness', amount: 50000, type: 'non-monetary' as const },
            ],
            netValue: -550000,
            benefitCostRatio: 0.21,
            roi: -78.6,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(result.costBenefitAnalysis![0].netValue).toBe(-550000);
      expect(result.costBenefitAnalysis![0].roi).toBeLessThan(0);
      expect(output).toContain('-$550,000');
      expect(output).toContain('-78.6%');
    });

    it('should compare multiple options with different financial metrics', () => {
      const cbaInput = {
        decisionStatement: 'Which marketing strategy should we choose?',
        options: [
          { id: 'digital', name: 'Digital Marketing', description: 'Online advertising and SEO' },
          { id: 'traditional', name: 'Traditional Marketing', description: 'TV, radio, print ads' },
          { id: 'hybrid', name: 'Hybrid Approach', description: 'Combination of both' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'marketing-strategy-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'digital',
            costs: [
              { optionId: 'digital', description: 'Ad spend', amount: 100000, type: 'monetary' as const },
            ],
            benefits: [
              { optionId: 'digital', description: 'Revenue', amount: 300000, type: 'monetary' as const },
            ],
            netValue: 200000,
            benefitCostRatio: 3.0,
            roi: 200,
          },
          {
            optionId: 'traditional',
            costs: [
              { optionId: 'traditional', description: 'Ad spend', amount: 500000, type: 'monetary' as const },
            ],
            benefits: [
              { optionId: 'traditional', description: 'Revenue', amount: 600000, type: 'monetary' as const },
            ],
            netValue: 100000,
            benefitCostRatio: 1.2,
            roi: 20,
          },
          {
            optionId: 'hybrid',
            costs: [
              { optionId: 'hybrid', description: 'Ad spend', amount: 250000, type: 'monetary' as const },
            ],
            benefits: [
              { optionId: 'hybrid', description: 'Revenue', amount: 550000, type: 'monetary' as const },
            ],
            netValue: 300000,
            benefitCostRatio: 2.2,
            roi: 120,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(result.costBenefitAnalysis).toHaveLength(3);
      expect(output).toContain('Digital Marketing');
      expect(output).toContain('Traditional Marketing');
      expect(output).toContain('Hybrid Approach');

      // Verify all three have different net values
      expect(result.costBenefitAnalysis![0].netValue).toBe(200000);
      expect(result.costBenefitAnalysis![1].netValue).toBe(100000);
      expect(result.costBenefitAnalysis![2].netValue).toBe(300000);

      // Verify ROI calculations
      expect(result.costBenefitAnalysis![0].roi).toBe(200);
      expect(result.costBenefitAnalysis![1].roi).toBe(20);
      expect(result.costBenefitAnalysis![2].roi).toBe(120);
    });

    it('should handle empty costs or benefits arrays', () => {
      const cbaInput = {
        decisionStatement: 'Should we pursue this free opportunity?',
        options: [
          { id: 'free', name: 'Free Opportunity', description: 'All benefits, no costs' },
        ],
        analysisType: 'cost-benefit' as const,
        stage: 'evaluation' as const,
        decisionId: 'free-opp-1',
        iteration: 0,
        nextStageNeeded: true,
        costBenefitAnalysis: [
          {
            optionId: 'free',
            costs: [],
            benefits: [
              { optionId: 'free', description: 'Free publicity', amount: 50000, type: 'non-monetary' as const },
            ],
            netValue: 50000,
            benefitCostRatio: 0,
            roi: 0,
          },
        ],
      };

      const result = server.processDecisionFramework(cbaInput);
      const output = server.formatOutput(result);

      expect(result.costBenefitAnalysis![0].costs).toHaveLength(0);
      expect(result.costBenefitAnalysis![0].benefits).toHaveLength(1);
      expect(result.costBenefitAnalysis![0].netValue).toBe(50000);
      expect(output).toContain('Cost-Benefit Analysis');
    });
  });
});
