import { describe, it, expect, beforeEach } from 'vitest';
import { HypothesisServer } from './hypothesisServer.js';

describe('HypothesisServer', () => {
  let server: HypothesisServer;

  beforeEach(() => {
    server = new HypothesisServer();
  });

  const validInput = {
    stage: 'hypothesis' as const,
    inquiryId: 'inquiry-1',
    iteration: 0,
    nextStageNeeded: true,
    observation: 'Users are abandoning checkout',
    question: 'Why are users not completing purchases?',
  };

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid scientific method data', () => {
    const result = server.processScientificMethod(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.stage).toBe('hypothesis');
    expect(parsed.inquiryId).toBe('inquiry-1');
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processScientificMethod({
      stage: 'observation',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processScientificMethod({
      ...validInput,
      iteration: -1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid nextStageNeeded type', () => {
    const result = server.processScientificMethod({
      ...validInput,
      nextStageNeeded: 'yes',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle all stage types', () => {
    const stages = [
      'observation',
      'question',
      'hypothesis',
      'experiment',
      'analysis',
      'conclusion',
      'iteration',
    ] as const;

    stages.forEach(stage => {
      const result = server.processScientificMethod({
        ...validInput,
        stage,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.stage).toBe(stage);
    });
  });

  it('should handle hypothesis with variables', () => {
    const result = server.processScientificMethod({
      ...validInput,
      hypothesis: {
        statement: 'Slow checkout causes abandonment',
        variables: [
          { name: 'checkout_time', type: 'independent' },
          { name: 'abandonment_rate', type: 'dependent' },
        ],
        assumptions: ['Users have stable internet'],
        hypothesisId: 'h1',
        confidence: 0.7,
        domain: 'UX',
        iteration: 0,
        status: 'proposed',
      },
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
  });

  describe('State Persistence', () => {
    it('should persist multiple stages for the same inquiry', () => {
      const inquiryId = 'persistent-inquiry-1';

      // Stage 1: Observation
      server.processScientificMethod({
        stage: 'observation' as const,
        inquiryId,
        iteration: 0,
        nextStageNeeded: true,
        observation: 'Users are abandoning checkout',
      });

      // Stage 2: Question
      server.processScientificMethod({
        stage: 'question' as const,
        inquiryId,
        iteration: 1,
        nextStageNeeded: true,
        question: 'Why are users not completing purchases?',
      });

      // Stage 3: Hypothesis
      server.processScientificMethod({
        stage: 'hypothesis' as const,
        inquiryId,
        iteration: 2,
        nextStageNeeded: true,
        hypothesis: {
          statement: 'Slow page load times cause abandonment',
          hypothesisId: 'h1',
          confidence: 0.7,
          domain: 'UX',
          iteration: 0,
          status: 'proposed',
          variables: [],
          assumptions: [],
        },
      });

      const history = server.getInquiryHistory(inquiryId);
      expect(history).toHaveLength(3);
      expect(history[0].iteration).toBe(0);
      expect(history[0].stage).toBe('observation');
      expect(history[1].iteration).toBe(1);
      expect(history[1].stage).toBe('question');
      expect(history[2].iteration).toBe(2);
      expect(history[2].stage).toBe('hypothesis');
    });

    it('should maintain separate state for different inquiries', () => {
      const inquiry1 = 'inquiry-alpha';
      const inquiry2 = 'inquiry-beta';

      // Add stages to inquiry 1
      server.processScientificMethod({
        ...validInput,
        inquiryId: inquiry1,
        iteration: 0,
        stage: 'observation' as const,
      });
      server.processScientificMethod({
        ...validInput,
        inquiryId: inquiry1,
        iteration: 1,
        stage: 'question' as const,
      });

      // Add stages to inquiry 2
      server.processScientificMethod({
        ...validInput,
        inquiryId: inquiry2,
        iteration: 0,
        stage: 'observation' as const,
      });

      const history1 = server.getInquiryHistory(inquiry1);
      const history2 = server.getInquiryHistory(inquiry2);

      expect(history1).toHaveLength(2);
      expect(history2).toHaveLength(1);
      expect(history1[0].inquiryId).toBe(inquiry1);
      expect(history2[0].inquiryId).toBe(inquiry2);
    });

    it('should return empty array for non-existent inquiry', () => {
      const history = server.getInquiryHistory('non-existent-inquiry');
      expect(history).toEqual([]);
    });

    describe('getHypothesisEvolution', () => {
      it('should track hypothesis evolution across stages', () => {
        const inquiryId = 'hypothesis-evolution-test';

        // Stage 1: Initial hypothesis
        server.processScientificMethod({
          stage: 'hypothesis' as const,
          inquiryId,
          iteration: 0,
          nextStageNeeded: true,
          hypothesis: {
            statement: 'Slow page load causes abandonment',
            hypothesisId: 'h1',
            confidence: 0.6,
            domain: 'UX',
            iteration: 0,
            status: 'proposed',
            variables: [
              { name: 'page_load_time', type: 'independent' },
              { name: 'abandonment_rate', type: 'dependent' },
            ],
            assumptions: ['Users have stable internet'],
          },
        });

        // Stage 2: Refined hypothesis after testing
        server.processScientificMethod({
          stage: 'hypothesis' as const,
          inquiryId,
          iteration: 1,
          nextStageNeeded: true,
          hypothesis: {
            statement: 'Page load times over 3 seconds cause abandonment',
            hypothesisId: 'h2',
            confidence: 0.75,
            domain: 'UX',
            iteration: 1,
            status: 'testing',
            variables: [
              { name: 'page_load_time', type: 'independent' },
              { name: 'abandonment_rate', type: 'dependent' },
            ],
            assumptions: ['Users have stable internet'],
            refinementOf: 'h1',
          },
        });

        // Stage 3: Confirmed hypothesis
        server.processScientificMethod({
          stage: 'hypothesis' as const,
          inquiryId,
          iteration: 2,
          nextStageNeeded: false,
          hypothesis: {
            statement: 'Page load times over 3 seconds cause abandonment',
            hypothesisId: 'h2',
            confidence: 0.9,
            domain: 'UX',
            iteration: 2,
            status: 'confirmed',
            variables: [
              { name: 'page_load_time', type: 'independent' },
              { name: 'abandonment_rate', type: 'dependent' },
            ],
            assumptions: ['Users have stable internet'],
            refinementOf: 'h1',
          },
        });

        const evolution = server.getHypothesisEvolution(inquiryId);

        expect(evolution.inquiryId).toBe(inquiryId);
        expect(evolution.totalStages).toBe(3);
        expect(evolution.hypothesesGenerated).toBe(2); // Two unique hypothesis statements
        expect(evolution.hypothesisChanges).toHaveLength(3);

        // Verify hypothesis changes are tracked correctly
        expect(evolution.hypothesisChanges[0].iteration).toBe(0);
        expect(evolution.hypothesisChanges[0].status).toBe('proposed');
        expect(evolution.hypothesisChanges[0].confidence).toBe(0.6);
        expect(evolution.hypothesisChanges[0].statement).toBe('Slow page load causes abandonment');

        expect(evolution.hypothesisChanges[1].iteration).toBe(1);
        expect(evolution.hypothesisChanges[1].status).toBe('testing');
        expect(evolution.hypothesisChanges[1].confidence).toBe(0.75);

        expect(evolution.hypothesisChanges[2].iteration).toBe(2);
        expect(evolution.hypothesisChanges[2].status).toBe('confirmed');
        expect(evolution.hypothesisChanges[2].confidence).toBe(0.9);

        // Verify current hypothesis
        expect(evolution.currentHypothesis.statement).toBe('Page load times over 3 seconds cause abandonment');
        expect(evolution.currentHypothesis.status).toBe('confirmed');
        expect(evolution.currentHypothesis.confidence).toBe(0.9);

        // Verify status progression
        expect(evolution.statusProgression).toEqual(['proposed', 'testing', 'confirmed']);
      });

      it('should track stage progression across scientific method', () => {
        const inquiryId = 'stage-progression-test';

        // Complete scientific method stages
        server.processScientificMethod({
          stage: 'observation' as const,
          inquiryId,
          iteration: 0,
          nextStageNeeded: true,
          observation: 'Users abandon checkout',
        });

        server.processScientificMethod({
          stage: 'question' as const,
          inquiryId,
          iteration: 1,
          nextStageNeeded: true,
          question: 'Why do users abandon checkout?',
        });

        server.processScientificMethod({
          stage: 'hypothesis' as const,
          inquiryId,
          iteration: 2,
          nextStageNeeded: true,
          hypothesis: {
            statement: 'Complex forms cause abandonment',
            hypothesisId: 'h1',
            confidence: 0.7,
            domain: 'UX',
            iteration: 0,
            status: 'proposed',
            variables: [],
            assumptions: [],
          },
        });

        server.processScientificMethod({
          stage: 'experiment' as const,
          inquiryId,
          iteration: 3,
          nextStageNeeded: true,
          experiment: {
            experimentId: 'exp1',
            design: 'A/B test',
            methodology: 'Split traffic between simple and complex forms',
            predictions: [
              { if: 'Form is simple', then: 'Lower abandonment rate' },
            ],
            controlMeasures: ['Same traffic distribution', 'Same time period'],
          },
        });

        server.processScientificMethod({
          stage: 'analysis' as const,
          inquiryId,
          iteration: 4,
          nextStageNeeded: true,
          analysis: 'Simple form showed 40% lower abandonment rate',
        });

        server.processScientificMethod({
          stage: 'conclusion' as const,
          inquiryId,
          iteration: 5,
          nextStageNeeded: false,
          conclusion: 'Form complexity is a significant factor in checkout abandonment',
        });

        const evolution = server.getHypothesisEvolution(inquiryId);

        expect(evolution.totalStages).toBe(6);
        expect(evolution.stages).toEqual(['observation', 'question', 'hypothesis', 'experiment', 'analysis', 'conclusion']);
      });

      it('should return empty evolution data for non-existent inquiry', () => {
        const evolution = server.getHypothesisEvolution('non-existent');

        expect(evolution.inquiryId).toBe('non-existent');
        expect(evolution.totalStages).toBe(0);
        expect(evolution.stages).toEqual([]);
        expect(evolution.hypothesesGenerated).toBe(0);
        expect(evolution.hypothesisChanges).toEqual([]);
        expect(evolution.currentHypothesis.statement).toBeNull();
        expect(evolution.currentHypothesis.status).toBeNull();
        expect(evolution.currentHypothesis.confidence).toBeNull();
        expect(evolution.statusProgression).toEqual([]);
      });

      it('should handle inquiry without hypothesis data', () => {
        const inquiryId = 'no-hypothesis-test';

        server.processScientificMethod({
          stage: 'observation' as const,
          inquiryId,
          iteration: 0,
          nextStageNeeded: true,
          observation: 'Users abandon checkout',
        });

        const evolution = server.getHypothesisEvolution(inquiryId);

        expect(evolution.totalStages).toBe(1);
        expect(evolution.hypothesesGenerated).toBe(0);
        expect(evolution.hypothesisChanges).toEqual([]);
        expect(evolution.currentHypothesis.statement).toBeNull();
      });
    });

    it('should preserve all inquiry data in history', () => {
      const inquiryId = 'data-preservation-test';

      const inquiryData = {
        stage: 'hypothesis' as const,
        inquiryId,
        iteration: 0,
        nextStageNeeded: true,
        observation: 'Test observation',
        question: 'Test question',
        analysis: 'Test analysis',
        conclusion: 'Test conclusion',
        hypothesis: {
          statement: 'Test hypothesis statement',
          hypothesisId: 'h1',
          confidence: 0.8,
          domain: 'Test Domain',
          iteration: 0,
          status: 'proposed' as const,
          variables: [
            {
              name: 'test_var',
              type: 'independent' as const,
              operationalization: 'Test measurement',
            },
          ],
          assumptions: ['Assumption 1', 'Assumption 2'],
          alternativeTo: ['Alt hypothesis 1'],
          refinementOf: 'h0',
        },
        experiment: {
          experimentId: 'exp1',
          design: 'Test design',
          methodology: 'Test methodology',
          predictions: [
            {
              if: 'Condition A',
              then: 'Outcome B',
              else: 'Outcome C',
            },
          ],
          controlMeasures: ['Control 1', 'Control 2'],
          results: 'Test results',
          outcomeMatched: true,
          unexpectedObservations: ['Observation 1'],
          limitations: ['Limitation 1'],
          nextSteps: ['Next step 1'],
        },
      };

      server.processScientificMethod(inquiryData);

      const history = server.getInquiryHistory(inquiryId);
      expect(history).toHaveLength(1);

      const stored = history[0];
      expect(stored.stage).toBe(inquiryData.stage);
      expect(stored.inquiryId).toBe(inquiryData.inquiryId);
      expect(stored.iteration).toBe(inquiryData.iteration);
      expect(stored.nextStageNeeded).toBe(inquiryData.nextStageNeeded);
      expect(stored.observation).toBe(inquiryData.observation);
      expect(stored.question).toBe(inquiryData.question);
      expect(stored.analysis).toBe(inquiryData.analysis);
      expect(stored.conclusion).toBe(inquiryData.conclusion);
      expect(stored.hypothesis).toEqual(inquiryData.hypothesis);
      expect(stored.experiment).toEqual(inquiryData.experiment);
    });
  });
});
