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

  describe('Risk Assessment Matrix', () => {
    it('should calculate probability × impact scoring and categorize all risk levels correctly', () => {
      const riskInput = {
        decisionStatement: 'Should we launch the new product now?',
        options: [
          { id: 'launch', name: 'Launch Now', description: 'Launch product immediately' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'product-launch-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          { optionId: 'launch', description: 'Major security vulnerability discovered', probability: 0.9, impact: 9, riskScore: 8.1, category: 'Security' },
          { optionId: 'launch', description: 'Competitor might release similar product', probability: 0.6, impact: 7, riskScore: 4.2, category: 'Market' },
          { optionId: 'launch', description: 'Minor UI bugs in edge cases', probability: 0.8, impact: 3, riskScore: 2.4, category: 'Quality' },
          { optionId: 'launch', description: 'Documentation not fully complete', probability: 0.3, impact: 2, riskScore: 0.6, category: 'Documentation' },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      // Verify analysis type
      expect(result.analysisType).toBe('risk-assessment');
      expect(result.riskAssessment).toHaveLength(4);

      // Verify risk scores are calculated correctly (probability × impact)
      expect(result.riskAssessment![0].riskScore).toBe(8.1); // 0.9 × 9 = 8.1
      expect(result.riskAssessment![1].riskScore).toBe(4.2); // 0.6 × 7 = 4.2
      expect(result.riskAssessment![2].riskScore).toBe(2.4); // 0.8 × 3 = 2.4
      expect(result.riskAssessment![3].riskScore).toBe(0.6); // 0.3 × 2 = 0.6

      // Verify output contains risk assessment headers
      expect(output).toContain('Risk Assessment Matrix');
      expect(output).toContain('Launch Now');

      // Verify all risk levels are displayed
      expect(output).toContain('CRITICAL'); // Risk score >= 7
      expect(output).toContain('HIGH');     // Risk score >= 4 and < 7
      expect(output).toContain('MEDIUM');   // Risk score >= 2 and < 4
      expect(output).toContain('LOW');      // Risk score < 2

      // Verify risk descriptions
      expect(output).toContain('Major security vulnerability discovered');
      expect(output).toContain('Competitor might release similar product');
      expect(output).toContain('Minor UI bugs in edge cases');
      expect(output).toContain('Documentation not fully complete');

      // Verify categories are displayed
      expect(output).toContain('Security');
      expect(output).toContain('Market');
      expect(output).toContain('Quality');
      expect(output).toContain('Documentation');

      // Verify probability and impact are displayed
      expect(output).toContain('90%');  // 0.9 as percentage
      expect(output).toContain('60%');  // 0.6 as percentage
      expect(output).toContain('9.0/10');  // impact
      expect(output).toContain('7.0/10');  // impact
    });

    it('should display mitigation strategies when provided', () => {
      const riskInput = {
        decisionStatement: 'Should we migrate to microservices architecture?',
        options: [
          { id: 'microservices', name: 'Migrate to Microservices', description: 'Redesign system as microservices' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'architecture-migration-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          {
            optionId: 'microservices',
            description: 'Service complexity and operational overhead',
            probability: 0.7,
            impact: 8,
            riskScore: 5.6,
            category: 'Architecture',
            mitigation: [
              'Start with pilot service to gain experience',
              'Invest in comprehensive monitoring and logging',
              'Establish clear service boundaries and contracts',
              'Create detailed runbooks and documentation',
            ],
          },
          {
            optionId: 'microservices',
            description: 'Data consistency challenges across services',
            probability: 0.8,
            impact: 7,
            riskScore: 5.6,
            category: 'Data',
            mitigation: [
              'Implement saga pattern for distributed transactions',
              'Use event sourcing for audit trails',
              'Define clear data ownership per service',
            ],
          },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Mitigation Strategies');
      expect(output).toContain('Start with pilot service to gain experience');
      expect(output).toContain('Invest in comprehensive monitoring and logging');
      expect(output).toContain('Establish clear service boundaries and contracts');
      expect(output).toContain('Create detailed runbooks and documentation');
      expect(output).toContain('Implement saga pattern for distributed transactions');
      expect(output).toContain('Use event sourcing for audit trails');
      expect(output).toContain('Define clear data ownership per service');
    });

    it('should calculate and display risk summary metrics correctly', () => {
      const riskInput = {
        decisionStatement: 'Should we expand to international markets?',
        options: [
          { id: 'expand', name: 'International Expansion', description: 'Launch in EU and Asia markets' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'intl-expansion-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          { optionId: 'expand', description: 'Regulatory compliance issues', probability: 0.8, impact: 9, riskScore: 7.2, category: 'Legal' },
          { optionId: 'expand', description: 'Currency exchange volatility', probability: 0.9, impact: 8, riskScore: 7.2, category: 'Financial' },
          { optionId: 'expand', description: 'Cultural misunderstandings', probability: 0.5, impact: 6, riskScore: 3.0, category: 'Cultural' },
          { optionId: 'expand', description: 'Supply chain complexity', probability: 0.6, impact: 5, riskScore: 3.0, category: 'Operations' },
          { optionId: 'expand', description: 'Language barriers', probability: 0.4, impact: 4, riskScore: 1.6, category: 'Communication' },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      // Total risks: 5
      expect(output).toContain('Total Risks: 5');

      // Critical risks (score >= 7): 2 (regulatory and currency)
      expect(output).toContain('Critical: 2');

      // High risks (score >= 4 and < 7): 0
      expect(output).toContain('High: 0');

      // Average risk score: (7.2 + 7.2 + 3.0 + 3.0 + 1.6) / 5 = 4.4
      expect(output).toContain('Average Risk Score: 4.40');

      // Maximum risk score: 7.2
      expect(output).toContain('Maximum Risk Score: 7.20');

      // Verify risk summary section exists
      expect(output).toContain('Risk Summary');
    });

    it('should display risk matrix visualization', () => {
      const riskInput = {
        decisionStatement: 'Should we adopt new technology stack?',
        options: [
          { id: 'adopt', name: 'Adopt New Stack', description: 'Switch to modern technology stack' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'tech-stack-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          { optionId: 'adopt', description: 'Team learning curve', probability: 0.9, impact: 5, riskScore: 4.5 },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Risk Matrix Visualization');
      expect(output).toContain('Probability vs Impact');
      expect(output).toContain('High (70-100%)');
      expect(output).toContain('Medium (30-70%)');
      expect(output).toContain('Low (0-30%)');
      expect(output).toContain('Low(1-3)');
      expect(output).toContain('Medium(4-6)');
      expect(output).toContain('High(7-10)');
    });

    it('should handle multiple options with different risk profiles', () => {
      const riskInput = {
        decisionStatement: 'Which deployment strategy should we use?',
        options: [
          { id: 'big-bang', name: 'Big Bang Deployment', description: 'Deploy all changes at once' },
          { id: 'phased', name: 'Phased Rollout', description: 'Gradual deployment over time' },
          { id: 'canary', name: 'Canary Deployment', description: 'Test with small user subset first' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'deployment-strategy-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          // Big Bang - High risk
          { optionId: 'big-bang', description: 'Complete system failure', probability: 0.4, impact: 10, riskScore: 4.0, category: 'System' },
          { optionId: 'big-bang', description: 'User experience disruption', probability: 0.7, impact: 8, riskScore: 5.6, category: 'UX' },
          { optionId: 'big-bang', description: 'No rollback option', probability: 0.9, impact: 9, riskScore: 8.1, category: 'Operations' },
          // Phased - Medium risk
          { optionId: 'phased', description: 'Version compatibility issues', probability: 0.5, impact: 6, riskScore: 3.0, category: 'Technical' },
          { optionId: 'phased', description: 'Extended deployment time', probability: 0.6, impact: 4, riskScore: 2.4, category: 'Timeline' },
          // Canary - Low risk
          { optionId: 'canary', description: 'Infrastructure complexity', probability: 0.3, impact: 5, riskScore: 1.5, category: 'Technical' },
          { optionId: 'canary', description: 'Monitoring overhead', probability: 0.4, impact: 3, riskScore: 1.2, category: 'Operations' },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      expect(result.riskAssessment).toHaveLength(7);

      // Verify all three options appear in output
      expect(output).toContain('Big Bang Deployment');
      expect(output).toContain('Phased Rollout');
      expect(output).toContain('Canary Deployment');

      // Verify different risk descriptions
      expect(output).toContain('Complete system failure');
      expect(output).toContain('Version compatibility issues');
      expect(output).toContain('Infrastructure complexity');

      // Verify risk summary appears for each option
      const summaryMatches = output.match(/Risk Summary:/g);
      expect(summaryMatches).toHaveLength(3);
    });

    it('should handle risks sorted by risk score (highest first)', () => {
      const riskInput = {
        decisionStatement: 'Should we acquire the competitor company?',
        options: [
          { id: 'acquire', name: 'Acquire Competitor', description: 'Purchase competitor for $50M' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'acquisition-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          // Added in non-sorted order
          { optionId: 'acquire', description: 'Minor brand confusion', probability: 0.3, impact: 3, riskScore: 0.9 },
          { optionId: 'acquire', description: 'Key talent departure', probability: 0.7, impact: 8, riskScore: 5.6 },
          { optionId: 'acquire', description: 'Cultural integration failure', probability: 0.8, impact: 9, riskScore: 7.2 },
          { optionId: 'acquire', description: 'Technology debt inherited', probability: 0.6, impact: 5, riskScore: 3.0 },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      // Extract positions of risk descriptions in output
      const culturalIndex = output.indexOf('Cultural integration failure');
      const talentIndex = output.indexOf('Key talent departure');
      const techDebtIndex = output.indexOf('Technology debt inherited');
      const brandIndex = output.indexOf('Minor brand confusion');

      // Verify they appear in descending risk score order
      expect(culturalIndex).toBeLessThan(talentIndex); // 7.2 before 5.6
      expect(talentIndex).toBeLessThan(techDebtIndex); // 5.6 before 3.0
      expect(techDebtIndex).toBeLessThan(brandIndex);  // 3.0 before 0.9
    });

    it('should handle edge case with empty risk assessment', () => {
      const riskInput = {
        decisionStatement: 'No risk scenario',
        options: [
          { id: 'safe', name: 'Safe Option', description: 'No risks identified' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'no-risk-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      expect(result.riskAssessment).toHaveLength(0);
      expect(output).toBe('');
    });

    it('should handle critical risks (score >= 7) with appropriate emphasis', () => {
      const riskInput = {
        decisionStatement: 'Should we proceed with emergency system upgrade?',
        options: [
          { id: 'upgrade', name: 'Emergency Upgrade', description: 'Immediate system upgrade required' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'emergency-upgrade-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          {
            optionId: 'upgrade',
            description: 'Complete data loss during migration',
            probability: 0.8,
            impact: 10,
            riskScore: 8.0,
            category: 'Data',
            mitigation: [
              'Create multiple backups before upgrade',
              'Test migration in staging environment',
              'Have rollback plan ready',
            ],
          },
          {
            optionId: 'upgrade',
            description: 'Extended downtime affecting customers',
            probability: 0.9,
            impact: 9,
            riskScore: 8.1,
            category: 'Service',
            mitigation: [
              'Schedule during lowest traffic period',
              'Notify customers in advance',
              'Have support team on standby',
            ],
          },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      // Verify critical risk label appears
      expect(output).toContain('CRITICAL');

      // Verify critical count in summary
      expect(output).toContain('Critical: 2');

      // Both risks should be above 7.0 threshold
      expect(result.riskAssessment![0].riskScore).toBeGreaterThanOrEqual(7);
      expect(result.riskAssessment![1].riskScore).toBeGreaterThanOrEqual(7);
    });

    it('should handle risks without categories or mitigation strategies', () => {
      const riskInput = {
        decisionStatement: 'Should we launch beta version?',
        options: [
          { id: 'beta', name: 'Beta Launch', description: 'Release beta to public' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'beta-launch-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          { optionId: 'beta', description: 'Negative user feedback', probability: 0.5, impact: 6, riskScore: 3.0 },
          { optionId: 'beta', description: 'Performance issues under load', probability: 0.6, impact: 7, riskScore: 4.2 },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      expect(result.riskAssessment).toHaveLength(2);
      expect(output).toContain('Negative user feedback');
      expect(output).toContain('Performance issues under load');

      // No mitigation strategies should appear
      const mitigationMatches = output.match(/Mitigation Strategies:/g);
      expect(mitigationMatches).toBeNull();
    });

    it('should verify probability × impact calculation for boundary values', () => {
      const riskInput = {
        decisionStatement: 'Test boundary risk calculations',
        options: [
          { id: 'test', name: 'Test Option', description: 'Testing risk score boundaries' },
        ],
        analysisType: 'risk-assessment' as const,
        stage: 'evaluation' as const,
        decisionId: 'boundary-test-1',
        iteration: 0,
        nextStageNeeded: true,
        riskAssessment: [
          // Maximum risk: 1.0 × 10 = 10.0 (CRITICAL)
          { optionId: 'test', description: 'Maximum risk scenario', probability: 1.0, impact: 10, riskScore: 10.0 },
          // Exact CRITICAL boundary: score = 7.0
          { optionId: 'test', description: 'Critical boundary', probability: 0.7, impact: 10, riskScore: 7.0 },
          // Just below CRITICAL: score = 6.9 (HIGH)
          { optionId: 'test', description: 'High risk boundary', probability: 0.69, impact: 10, riskScore: 6.9 },
          // Exact HIGH boundary: score = 4.0
          { optionId: 'test', description: 'High boundary', probability: 0.4, impact: 10, riskScore: 4.0 },
          // Just below HIGH: score = 3.9 (MEDIUM)
          { optionId: 'test', description: 'Medium risk boundary', probability: 0.39, impact: 10, riskScore: 3.9 },
          // Exact MEDIUM boundary: score = 2.0
          { optionId: 'test', description: 'Medium boundary', probability: 0.2, impact: 10, riskScore: 2.0 },
          // Just below MEDIUM: score = 1.9 (LOW)
          { optionId: 'test', description: 'Low risk boundary', probability: 0.19, impact: 10, riskScore: 1.9 },
          // Minimum risk: 0.0 × 1 = 0.0 (LOW)
          { optionId: 'test', description: 'Minimum risk scenario', probability: 0.0, impact: 1, riskScore: 0.0 },
        ],
      };

      const result = server.processDecisionFramework(riskInput);
      const output = server.formatOutput(result);

      // Verify risk scores
      expect(result.riskAssessment![0].riskScore).toBe(10.0);
      expect(result.riskAssessment![1].riskScore).toBe(7.0);
      expect(result.riskAssessment![2].riskScore).toBe(6.9);
      expect(result.riskAssessment![3].riskScore).toBe(4.0);
      expect(result.riskAssessment![4].riskScore).toBe(3.9);
      expect(result.riskAssessment![5].riskScore).toBe(2.0);
      expect(result.riskAssessment![6].riskScore).toBe(1.9);
      expect(result.riskAssessment![7].riskScore).toBe(0.0);

      // Verify risk level categorization in output
      expect(output).toContain('CRITICAL');
      expect(output).toContain('HIGH');
      expect(output).toContain('MEDIUM');
      expect(output).toContain('LOW');

      // Verify summary: Critical = 2 (10.0, 7.0), High = 2 (6.9, 4.0)
      expect(output).toContain('Critical: 2');
      expect(output).toContain('High: 2');
    });
  });

  describe('Reversibility Analysis', () => {
    it('should classify two-way door decisions with MOVE FAST recommendation', () => {
      const reversibilityInput = {
        decisionStatement: 'Should we change our homepage design?',
        options: [
          { id: 'newdesign', name: 'New Homepage Design', description: 'Update homepage with modern layout' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'homepage-design-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'newdesign',
            reversibilityScore: 0.9,
            undoCost: 500,
            timeToReverse: 2,
            doorType: 'two-way' as const,
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.analysisType).toBe('reversibility');
      expect(result.reversibilityAnalysis).toHaveLength(1);
      expect(result.reversibilityAnalysis![0].doorType).toBe('two-way');
      expect(result.reversibilityAnalysis![0].reversibilityScore).toBe(0.9);
      expect(output).toContain('Reversibility Analysis');
      expect(output).toContain('TWO-WAY DOOR');
      expect(output).toContain('easily reversed');
      expect(output).toContain('90%');
      expect(output).toContain('$500');
      expect(output).toContain('2 days');
      expect(output).toContain('MOVE FAST');
      expect(output).toContain('Low risk, easily reversible');
    });

    it('should classify one-way door decisions with MOVE SLOW recommendation', () => {
      const reversibilityInput = {
        decisionStatement: 'Should we merge with competitor company?',
        options: [
          { id: 'merge', name: 'Merge with Competitor', description: 'Full company merger and integration' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'merger-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'merge',
            reversibilityScore: 0.1,
            undoCost: 50000000,
            timeToReverse: 730,
            doorType: 'one-way' as const,
            undoComplexity: 'Extremely complex: legal entanglements, employee impact, brand damage',
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].doorType).toBe('one-way');
      expect(result.reversibilityAnalysis![0].reversibilityScore).toBe(0.1);
      expect(output).toContain('ONE-WAY DOOR');
      expect(output).toContain('difficult or costly to reverse');
      expect(output).toContain('10%');
      expect(output).toContain('$50,000,000');
      expect(output).toContain('730 days');
      expect(output).toContain('MOVE SLOW');
      expect(output).toContain('High stakes, difficult to reverse');
      expect(output).toContain('one-way door. Invest significant time');
      expect(output).toContain('Extremely complex');
    });

    it('should show MODERATE PACE for two-way doors with moderate reversibility', () => {
      const reversibilityInput = {
        decisionStatement: 'Should we switch to a new project management tool?',
        options: [
          { id: 'newtool', name: 'Switch to New PM Tool', description: 'Migrate to modern project management platform' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'pm-tool-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'newtool',
            reversibilityScore: 0.6,
            undoCost: 8000,
            timeToReverse: 14,
            doorType: 'two-way' as const,
            undoComplexity: 'Moderate: data migration, team retraining',
            reversibilityNotes: 'Can export data and switch back, but will lose some custom workflows',
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].reversibilityScore).toBe(0.6);
      expect(output).toContain('TWO-WAY DOOR');
      expect(output).toContain('60%');
      expect(output).toContain('$8,000');
      expect(output).toContain('14 days');
      expect(output).toContain('MODERATE PACE');
      expect(output).toContain('Reversible but with some cost');
      expect(output).toContain('Moderate: data migration, team retraining');
      expect(output).toContain('Can export data and switch back');
    });

    it('should show PROCEED WITH CAUTION for one-way doors with moderate reversibility', () => {
      const reversibilityInput = {
        decisionStatement: 'Should we rewrite the application in a new programming language?',
        options: [
          { id: 'rewrite', name: 'Rewrite in Rust', description: 'Complete rewrite from Node.js to Rust' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'language-rewrite-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'rewrite',
            reversibilityScore: 0.4,
            undoCost: 250000,
            timeToReverse: 180,
            doorType: 'one-way' as const,
            undoComplexity: 'High: complete code rewrite, team skill changes',
            reversibilityNotes: 'Technically possible to revert, but wasteful investment and team morale impact',
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].doorType).toBe('one-way');
      expect(result.reversibilityAnalysis![0].reversibilityScore).toBe(0.4);
      expect(output).toContain('ONE-WAY DOOR');
      expect(output).toContain('40%');
      expect(output).toContain('$250,000');
      expect(output).toContain('180 days');
      expect(output).toContain('PROCEED WITH CAUTION');
      expect(output).toContain('One-way door with moderate reversibility');
      expect(output).toContain('Careful consideration needed');
      expect(output).toContain('High: complete code rewrite');
      expect(output).toContain('Technically possible to revert');
    });

    it('should compare multiple options with different door types and reversibility', () => {
      const reversibilityInput = {
        decisionStatement: 'How should we scale our infrastructure?',
        options: [
          { id: 'vertical', name: 'Vertical Scaling', description: 'Upgrade existing servers' },
          { id: 'horizontal', name: 'Horizontal Scaling', description: 'Add more servers with load balancing' },
          { id: 'serverless', name: 'Serverless Architecture', description: 'Complete migration to serverless' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'scaling-strategy-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'vertical',
            reversibilityScore: 0.8,
            undoCost: 2000,
            timeToReverse: 3,
            doorType: 'two-way' as const,
            reversibilityNotes: 'Can easily downgrade or switch to different hardware',
          },
          {
            optionId: 'horizontal',
            reversibilityScore: 0.7,
            undoCost: 5000,
            timeToReverse: 7,
            doorType: 'two-way' as const,
            undoComplexity: 'Low: remove servers and reconfigure load balancer',
          },
          {
            optionId: 'serverless',
            reversibilityScore: 0.3,
            undoCost: 100000,
            timeToReverse: 90,
            doorType: 'one-way' as const,
            undoComplexity: 'High: architecture redesign, code refactoring, stateful services',
            reversibilityNotes: 'Major vendor lock-in and architectural changes make reversal expensive',
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis).toHaveLength(3);
      expect(output).toContain('Vertical Scaling');
      expect(output).toContain('Horizontal Scaling');
      expect(output).toContain('Serverless Architecture');
      expect(output).toContain('80%');
      expect(output).toContain('70%');
      expect(output).toContain('30%');

      // Verify different recommendations
      expect(output).toContain('MOVE FAST');
      expect(output).toContain('PROCEED WITH CAUTION');
    });

    it('should display reversibility metrics with correct color coding thresholds', () => {
      const reversibilityInput = {
        decisionStatement: 'Test reversibility metric thresholds',
        options: [
          { id: 'high', name: 'High Reversibility', description: 'Easy to reverse' },
          { id: 'medium', name: 'Medium Reversibility', description: 'Moderate to reverse' },
          { id: 'low', name: 'Low Reversibility', description: 'Hard to reverse' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'metrics-test-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'high',
            reversibilityScore: 0.75, // Green (≥0.7)
            undoCost: 800,             // Green (<1000)
            timeToReverse: 5,          // Green (<7)
            doorType: 'two-way' as const,
          },
          {
            optionId: 'medium',
            reversibilityScore: 0.5,   // Yellow (≥0.4, <0.7)
            undoCost: 5000,            // Yellow (≥1000, <10000)
            timeToReverse: 15,         // Yellow (≥7, <30)
            doorType: 'two-way' as const,
          },
          {
            optionId: 'low',
            reversibilityScore: 0.2,   // Red (<0.4)
            undoCost: 50000,           // Red (≥10000)
            timeToReverse: 60,         // Red (≥30)
            doorType: 'one-way' as const,
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].reversibilityScore).toBe(0.75);
      expect(result.reversibilityAnalysis![1].reversibilityScore).toBe(0.5);
      expect(result.reversibilityAnalysis![2].reversibilityScore).toBe(0.2);
      expect(output).toContain('75%');
      expect(output).toContain('50%');
      expect(output).toContain('20%');
      expect(output).toContain('$800');
      expect(output).toContain('$5,000');
      expect(output).toContain('$50,000');
    });

    it('should handle edge case with 1 day timeToReverse showing singular "day"', () => {
      const reversibilityInput = {
        decisionStatement: 'Quick reversible decision',
        options: [
          { id: 'quick', name: 'Quick Change', description: 'Very fast to reverse' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'quick-reverse-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'quick',
            reversibilityScore: 0.95,
            undoCost: 100,
            timeToReverse: 1,
            doorType: 'two-way' as const,
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].timeToReverse).toBe(1);
      expect(output).toContain('1 day');
      expect(output).not.toContain('1 days');
    });

    it('should handle empty reversibilityAnalysis array', () => {
      const reversibilityInput = {
        decisionStatement: 'No reversibility data',
        options: [
          { id: 'option', name: 'Some Option', description: 'No reversibility analysis' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'no-data-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis).toHaveLength(0);
      expect(output).toBe('');
    });

    it('should display Bezos Two-Way Door Framework guidance', () => {
      const reversibilityInput = {
        decisionStatement: 'Test framework guidance',
        options: [
          { id: 'test', name: 'Test Option', description: 'Test description' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'guidance-test-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'test',
            reversibilityScore: 0.5,
            undoCost: 1000,
            timeToReverse: 10,
            doorType: 'two-way' as const,
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Bezos\'s Two-Way Door Framework');
      expect(output).toContain('One-way doors');
      expect(output).toContain('Irreversible decisions requiring careful deliberation');
      expect(output).toContain('Two-way doors');
      expect(output).toContain('Reversible decisions where speed matters more than perfection');
    });

    it('should handle reversibility without optional fields', () => {
      const reversibilityInput = {
        decisionStatement: 'Minimal reversibility data',
        options: [
          { id: 'minimal', name: 'Minimal Data', description: 'Only required fields' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'minimal-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'minimal',
            reversibilityScore: 0.5,
            undoCost: 5000,
            timeToReverse: 10,
            doorType: 'two-way' as const,
            // No undoComplexity or reversibilityNotes
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis![0].undoComplexity).toBeUndefined();
      expect(result.reversibilityAnalysis![0].reversibilityNotes).toBeUndefined();
      expect(output).toContain('50%');
      expect(output).toContain('$5,000');
      expect(output).toContain('10 days');
      // Should not contain complexity or notes sections
      expect(output).not.toContain('Complexity:');
      expect(output).not.toContain('Notes:');
    });

    it('should verify decision speed recommendations for exact boundary values', () => {
      const reversibilityInput = {
        decisionStatement: 'Test boundary values for recommendations',
        options: [
          { id: 'boundary1', name: 'Two-way 70% (boundary)', description: 'Exactly 70% reversibility' },
          { id: 'boundary2', name: 'Two-way 69% (below)', description: 'Just below 70%' },
          { id: 'boundary3', name: 'One-way 30% (boundary)', description: 'Exactly 30% reversibility' },
          { id: 'boundary4', name: 'One-way 29% (below)', description: 'Just below 30%' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'boundary-recommendations-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'boundary1',
            reversibilityScore: 0.7,
            undoCost: 1000,
            timeToReverse: 5,
            doorType: 'two-way' as const,
          },
          {
            optionId: 'boundary2',
            reversibilityScore: 0.69,
            undoCost: 1000,
            timeToReverse: 5,
            doorType: 'two-way' as const,
          },
          {
            optionId: 'boundary3',
            reversibilityScore: 0.3,
            undoCost: 10000,
            timeToReverse: 30,
            doorType: 'one-way' as const,
          },
          {
            optionId: 'boundary4',
            reversibilityScore: 0.29,
            undoCost: 10000,
            timeToReverse: 30,
            doorType: 'one-way' as const,
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      // Extract positions of recommendations in output
      const moveFastIndex = output.indexOf('MOVE FAST');
      const moderatePaceIndex = output.indexOf('MODERATE PACE');
      const proceedCautionIndex = output.indexOf('PROCEED WITH CAUTION');
      const moveSlowIndex = output.indexOf('MOVE SLOW');

      // Two-way 70% should get MOVE FAST
      expect(moveFastIndex).toBeGreaterThan(-1);
      // Two-way 69% should get MODERATE PACE
      expect(moderatePaceIndex).toBeGreaterThan(-1);
      // One-way 30% should get PROCEED WITH CAUTION
      expect(proceedCautionIndex).toBeGreaterThan(-1);
      // One-way 29% should get MOVE SLOW
      expect(moveSlowIndex).toBeGreaterThan(-1);

      // Verify exact percentages
      expect(output).toContain('70%');
      expect(output).toContain('69%');
      expect(output).toContain('30%');
      expect(output).toContain('29%');
    });

    it('should handle real-world scenario: hiring decision', () => {
      const reversibilityInput = {
        decisionStatement: 'Should we hire this candidate for a permanent position?',
        options: [
          { id: 'permanent', name: 'Permanent Hire', description: 'Full-time employee with benefits' },
          { id: 'contract', name: 'Contract Hire', description: '6-month contract with option to extend' },
        ],
        analysisType: 'reversibility' as const,
        stage: 'evaluation' as const,
        decisionId: 'hiring-1',
        iteration: 0,
        nextStageNeeded: true,
        reversibilityAnalysis: [
          {
            optionId: 'permanent',
            reversibilityScore: 0.3,
            undoCost: 75000,
            timeToReverse: 90,
            doorType: 'one-way' as const,
            undoComplexity: 'High: severance, legal, morale impact, reputation damage',
            reversibilityNotes: 'Letting someone go is costly and difficult. Consider probation period to mitigate.',
          },
          {
            optionId: 'contract',
            reversibilityScore: 0.85,
            undoCost: 5000,
            timeToReverse: 14,
            doorType: 'two-way' as const,
            undoComplexity: 'Low: contract ends naturally or can be terminated with notice',
            reversibilityNotes: 'Easy to convert to permanent or part ways at contract end',
          },
        ],
      };

      const result = server.processDecisionFramework(reversibilityInput);
      const output = server.formatOutput(result);

      expect(result.reversibilityAnalysis).toHaveLength(2);
      expect(output).toContain('Permanent Hire');
      expect(output).toContain('Contract Hire');
      expect(output).toContain('ONE-WAY DOOR');
      expect(output).toContain('TWO-WAY DOOR');
      expect(output).toContain('30%');
      expect(output).toContain('85%');
      expect(output).toContain('$75,000');
      expect(output).toContain('$5,000');
      expect(output).toContain('PROCEED WITH CAUTION');
      expect(output).toContain('MOVE FAST');
      expect(output).toContain('severance, legal, morale impact');
      expect(output).toContain('Easy to convert to permanent');
    });
  });

  describe('Regret Minimization Framework', () => {
    it('should display 10/10/10 analysis with all three time horizons', () => {
      const regretInput = {
        decisionStatement: 'Should I quit my stable job to start a company?',
        options: [
          { id: 'quit', name: 'Quit and Start Company', description: 'Leave stable job to pursue entrepreneurship' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'career-decision-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'quit',
            futureSelfPerspective: 'Looking back from age 80, will I regret not taking this chance when I had the energy and fewer responsibilities?',
            potentialRegrets: {
              tenMinutes: 'Immediate anxiety about financial stability and uncertainty',
              tenMonths: 'Might regret the stress and financial struggles, but proud of taking action',
              tenYears: 'Will likely regret NOT trying - the "what if" question will haunt me forever',
            },
            regretScore: 2.5,
            timeHorizonAnalysis: 'Short-term concerns fade quickly, while long-term regret of not pursuing dreams persists',
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.analysisType).toBe('regret-minimization');
      expect(result.regretMinimizationAnalysis).toHaveLength(1);
      expect(output).toContain('Regret Minimization Framework');
      expect(output).toContain('10/10/10 Analysis');
      expect(output).toContain('Future Self Perspective');

      // Check all three time horizons appear
      expect(output).toContain('In 10 Minutes');
      expect(output).toContain('In 10 Months');
      expect(output).toContain('In 10 Years');

      // Check emoji indicators
      expect(output).toContain('⏱️');
      expect(output).toContain('📅');
      expect(output).toContain('🔮');

      // Check regret content
      expect(output).toContain('Immediate anxiety about financial stability');
      expect(output).toContain('Might regret the stress and financial struggles');
      expect(output).toContain('Will likely regret NOT trying');

      // Check regret score
      expect(output).toContain('2.5/10');
      expect(output).toContain('Low regret potential');

      // Check time horizon analysis
      expect(output).toContain('Short-term concerns fade quickly');

      // Check framework guidance
      expect(output).toContain('Regret Minimization Guidance');
      expect(output).toContain('Will I regret not taking this action when I\'m 80?');
    });

    it('should handle low regret score (<=3) with green indicator', () => {
      const regretInput = {
        decisionStatement: 'Should I invest in learning a new programming language?',
        options: [
          { id: 'learn', name: 'Learn Rust', description: 'Dedicate 3 months to mastering Rust' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'learning-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'learn',
            futureSelfPerspective: 'Investing in skills is rarely regrettable - it compounds over time',
            potentialRegrets: {
              tenMinutes: 'None - excited to learn something new',
              tenMonths: 'Happy with new capabilities and career opportunities',
              tenYears: 'Grateful for expanding technical expertise when I had the chance',
            },
            regretScore: 1.0,
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis![0].regretScore).toBe(1.0);
      expect(output).toContain('1.0/10');
      expect(output).toContain('Low regret potential');
      expect(output).toContain('decision aligns with long-term values');
      expect(output).toContain('✓');
    });

    it('should handle moderate regret score (4-6) with yellow indicator', () => {
      const regretInput = {
        decisionStatement: 'Should I accept a promotion that requires relocation?',
        options: [
          { id: 'accept', name: 'Accept Promotion', description: 'Move to new city for senior role' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'relocation-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'accept',
            futureSelfPerspective: 'Career advancement vs. leaving established community and relationships',
            potentialRegrets: {
              tenMinutes: 'Uncertain - could go either way',
              tenMonths: 'May regret leaving friends and community, but career is advancing',
              tenYears: 'Could regret either choice - depends on how relationships and career develop',
            },
            regretScore: 5.0,
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis![0].regretScore).toBe(5.0);
      expect(output).toContain('5.0/10');
      expect(output).toContain('Moderate regret potential');
      expect(output).toContain('consider implications carefully');
      expect(output).toContain('⚠');
    });

    it('should handle high regret score (>6) with red indicator', () => {
      const regretInput = {
        decisionStatement: 'Should I compromise my values for a high-paying job?',
        options: [
          { id: 'compromise', name: 'Take the Job', description: 'Accept position at company with questionable ethics' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'ethics-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'compromise',
            futureSelfPerspective: 'Money is temporary, but integrity and self-respect are permanent',
            potentialRegrets: {
              tenMinutes: 'Immediate relief from financial pressure, but nagging doubt',
              tenMonths: 'Deep regret - the money doesn\'t compensate for the loss of self-respect',
              tenYears: 'Profound regret - this choice conflicts with core values and identity',
            },
            regretScore: 8.5,
            timeHorizonAnalysis: 'Financial gains are short-term, but values-based regrets persist for decades',
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis![0].regretScore).toBe(8.5);
      expect(output).toContain('8.5/10');
      expect(output).toContain('High regret potential');
      expect(output).toContain('reconsider this option');
      expect(output).toContain('⚠');
    });

    it('should compare multiple options with different regret profiles', () => {
      const regretInput = {
        decisionStatement: 'What should I do after college graduation?',
        options: [
          { id: 'corporate', name: 'Corporate Job', description: 'Stable, well-paying corporate position' },
          { id: 'startup', name: 'Join Startup', description: 'High-risk startup with equity' },
          { id: 'travel', name: 'Travel Year', description: 'Defer career to travel the world' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'post-graduation-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'corporate',
            futureSelfPerspective: 'Safe choice, but might wonder about missed adventures',
            potentialRegrets: {
              tenMinutes: 'Relief at having a plan and income',
              tenMonths: 'Content but curious about alternatives',
              tenYears: 'May regret playing it too safe when young and free',
            },
            regretScore: 4.5,
          },
          {
            optionId: 'startup',
            futureSelfPerspective: 'High-risk, high-learning opportunity in formative years',
            potentialRegrets: {
              tenMinutes: 'Excited and nervous about the adventure',
              tenMonths: 'Learning tons, grateful for the experience regardless of outcome',
              tenYears: 'Proud of taking the risk when I could afford to',
            },
            regretScore: 2.0,
          },
          {
            optionId: 'travel',
            futureSelfPerspective: 'Once-in-a-lifetime opportunity before life responsibilities accumulate',
            potentialRegrets: {
              tenMinutes: 'Thrill of freedom and possibility',
              tenMonths: 'Incredible experiences, though financial reality looming',
              tenYears: 'Zero regrets - these experiences shaped who I became',
            },
            regretScore: 1.5,
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis).toHaveLength(3);

      // Verify all options appear
      expect(output).toContain('Corporate Job');
      expect(output).toContain('Join Startup');
      expect(output).toContain('Travel Year');

      // Verify regret scores
      expect(output).toContain('4.5/10');
      expect(output).toContain('2.0/10');
      expect(output).toContain('1.5/10');

      // Verify different regret perspectives
      expect(output).toContain('Safe choice, but might wonder');
      expect(output).toContain('High-risk, high-learning opportunity');
      expect(output).toContain('Once-in-a-lifetime opportunity');

      // Verify time horizon content
      expect(output).toContain('Relief at having a plan');
      expect(output).toContain('Learning tons, grateful for the experience');
      expect(output).toContain('Zero regrets - these experiences shaped');
    });

    it('should handle missing optional fields (regretScore and timeHorizonAnalysis)', () => {
      const regretInput = {
        decisionStatement: 'Should I speak up at the meeting?',
        options: [
          { id: 'speak', name: 'Voice Opinion', description: 'Share my perspective publicly' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'speak-up-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'speak',
            futureSelfPerspective: 'Better to speak and be heard than stay silent and wonder "what if"',
            potentialRegrets: {
              tenMinutes: 'Might feel vulnerable or exposed',
              tenMonths: 'Glad I contributed my voice',
              tenYears: 'Won\'t even remember the anxiety, but will remember speaking up',
            },
            // No regretScore or timeHorizonAnalysis
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis![0].regretScore).toBeUndefined();
      expect(result.regretMinimizationAnalysis![0].timeHorizonAnalysis).toBeUndefined();

      // Should still show all required fields
      expect(output).toContain('Future Self Perspective');
      expect(output).toContain('In 10 Minutes');
      expect(output).toContain('In 10 Months');
      expect(output).toContain('In 10 Years');

      // Should not show optional sections
      expect(output).not.toContain('Overall Regret Score');
      expect(output).not.toContain('Time Horizon Analysis:');
    });

    it('should handle boundary regret scores (3.0, 6.0)', () => {
      const regretInput = {
        decisionStatement: 'Test regret score boundaries',
        options: [
          { id: 'low-boundary', name: 'Low Score Boundary', description: 'Exactly 3.0 regret score' },
          { id: 'medium-boundary', name: 'Medium Score Boundary', description: 'Exactly 6.0 regret score' },
          { id: 'high-boundary', name: 'High Score Boundary', description: 'Just above 6.0' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'boundary-test-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'low-boundary',
            futureSelfPerspective: 'Testing low boundary at exactly 3.0',
            potentialRegrets: {
              tenMinutes: 'Test 10 minutes',
              tenMonths: 'Test 10 months',
              tenYears: 'Test 10 years',
            },
            regretScore: 3.0,
          },
          {
            optionId: 'medium-boundary',
            futureSelfPerspective: 'Testing medium boundary at exactly 6.0',
            potentialRegrets: {
              tenMinutes: 'Test 10 minutes',
              tenMonths: 'Test 10 months',
              tenYears: 'Test 10 years',
            },
            regretScore: 6.0,
          },
          {
            optionId: 'high-boundary',
            futureSelfPerspective: 'Testing high boundary just above 6.0',
            potentialRegrets: {
              tenMinutes: 'Test 10 minutes',
              tenMonths: 'Test 10 months',
              tenYears: 'Test 10 years',
            },
            regretScore: 6.1,
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      // Verify scores
      expect(result.regretMinimizationAnalysis![0].regretScore).toBe(3.0);
      expect(result.regretMinimizationAnalysis![1].regretScore).toBe(6.0);
      expect(result.regretMinimizationAnalysis![2].regretScore).toBe(6.1);

      // 3.0 should be LOW (<=3)
      const lowIndex = output.indexOf('3.0/10');
      const lowRegretIndex = output.indexOf('Low regret potential', lowIndex);
      expect(lowRegretIndex).toBeGreaterThan(lowIndex);

      // 6.0 should be MODERATE (<=6)
      const mediumIndex = output.indexOf('6.0/10');
      const moderateRegretIndex = output.indexOf('Moderate regret potential', mediumIndex);
      expect(moderateRegretIndex).toBeGreaterThan(mediumIndex);

      // 6.1 should be HIGH (>6)
      const highIndex = output.indexOf('6.1/10');
      const highRegretIndex = output.indexOf('High regret potential', highIndex);
      expect(highRegretIndex).toBeGreaterThan(highIndex);
    });

    it('should handle empty regretMinimizationAnalysis array', () => {
      const regretInput = {
        decisionStatement: 'No regret analysis provided',
        options: [
          { id: 'option', name: 'Some Option', description: 'No regret data' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'no-data-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis).toHaveLength(0);
      expect(output).toBe('');
    });

    it('should display framework guidance about long-term perspective', () => {
      const regretInput = {
        decisionStatement: 'Test framework guidance display',
        options: [
          { id: 'test', name: 'Test Option', description: 'Testing guidance' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'guidance-test-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'test',
            futureSelfPerspective: 'Test perspective',
            potentialRegrets: {
              tenMinutes: 'Test',
              tenMonths: 'Test',
              tenYears: 'Test',
            },
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(output).toContain('Regret Minimization Guidance');
      expect(output).toContain('Will I regret not taking this action when I\'m 80?');
      expect(output).toContain('Short-term concerns');
      expect(output).toContain('long-term regrets');
      expect(output).toContain('future self\'s values and priorities');
    });

    it('should handle real-world scenario: major life decision with time horizon analysis', () => {
      const regretInput = {
        decisionStatement: 'Should I have children?',
        options: [
          { id: 'yes', name: 'Have Children', description: 'Start a family in the next few years' },
          { id: 'no', name: 'Remain Child-Free', description: 'Focus on career, hobbies, and freedom' },
        ],
        analysisType: 'regret-minimization' as const,
        stage: 'evaluation' as const,
        decisionId: 'life-decision-1',
        iteration: 0,
        nextStageNeeded: true,
        regretMinimizationAnalysis: [
          {
            optionId: 'yes',
            futureSelfPerspective: 'At 80, will I value the legacy and relationships, or regret the sacrifices?',
            potentialRegrets: {
              tenMinutes: 'Excited but anxious about the commitment and responsibility',
              tenMonths: 'Sleep-deprived and overwhelmed, questioning the decision during hard moments',
              tenYears: 'Deep fulfillment from watching them grow, though sacrifices were real',
            },
            regretScore: 2.0,
            timeHorizonAnalysis: 'The immediate challenges are intense but temporary. Long-term, most parents report deep satisfaction despite the costs.',
          },
          {
            optionId: 'no',
            futureSelfPerspective: 'At 80, will I value the freedom and achievements, or feel the absence of children?',
            potentialRegrets: {
              tenMinutes: 'Relief at maintaining current lifestyle and freedom',
              tenMonths: 'Enjoying career advancement and personal pursuits without constraints',
              tenYears: 'May feel the absence during family gatherings, wondering about missed experiences',
            },
            regretScore: 5.5,
            timeHorizonAnalysis: 'The freedom is wonderful now, but some report feeling the absence more acutely in later years when biological clock has passed.',
          },
        ],
      };

      const result = server.processDecisionFramework(regretInput);
      const output = server.formatOutput(result);

      expect(result.regretMinimizationAnalysis).toHaveLength(2);
      expect(output).toContain('Have Children');
      expect(output).toContain('Remain Child-Free');

      // Check regret scores and interpretations
      expect(output).toContain('2.0/10');
      expect(output).toContain('Low regret potential');
      expect(output).toContain('5.5/10');
      expect(output).toContain('Moderate regret potential');

      // Check time horizon analyses
      expect(output).toContain('The immediate challenges are intense but temporary');
      expect(output).toContain('The freedom is wonderful now');

      // Check future perspectives
      expect(output).toContain('will I value the legacy and relationships');
      expect(output).toContain('will I value the freedom and achievements');

      // Check 10/10/10 content
      expect(output).toContain('Sleep-deprived and overwhelmed');
      expect(output).toContain('Deep fulfillment from watching them grow');
      expect(output).toContain('Enjoying career advancement');
      expect(output).toContain('May feel the absence during family gatherings');
    });
  });
});
