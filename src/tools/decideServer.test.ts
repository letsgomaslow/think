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
});
