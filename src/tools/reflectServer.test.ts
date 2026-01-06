import { describe, it, expect, beforeEach } from 'vitest';
import { ReflectServer } from './reflectServer.js';

describe('ReflectServer', () => {
  let server: ReflectServer;

  beforeEach(() => {
    server = new ReflectServer();
  });

  const validInput = {
    task: 'Evaluate my understanding of quantum computing',
    stage: 'knowledge-assessment' as const,
    overallConfidence: 0.6,
    uncertaintyAreas: ['Quantum entanglement', 'Error correction'],
    recommendedApproach: 'Start with foundational concepts',
    monitoringId: 'monitor-1',
    iteration: 0,
    nextAssessmentNeeded: true,
  };

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid metacognitive monitoring data', () => {
    const result = server.processMetacognitiveMonitoring(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.task).toBe('Evaluate my understanding of quantum computing');
    expect(parsed.overallConfidence).toBe(0.6);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processMetacognitiveMonitoring({
      task: 'test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: 1.5,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: -0.1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      iteration: -1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle all stage types', () => {
    const stages = [
      'knowledge-assessment',
      'planning',
      'execution',
      'monitoring',
      'evaluation',
      'reflection',
    ] as const;

    stages.forEach(stage => {
      const result = server.processMetacognitiveMonitoring({
        ...validInput,
        stage,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.stage).toBe(stage);
    });
  });

  describe('State Persistence', () => {
    it('should persist multiple assessments for the same monitoring session', () => {
      const monitoringId = 'persistent-monitoring-1';

      // First assessment
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId,
        iteration: 0,
        stage: 'knowledge-assessment' as const,
        overallConfidence: 0.5,
      });

      // Second assessment
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId,
        iteration: 1,
        stage: 'planning' as const,
        overallConfidence: 0.6,
      });

      // Third assessment
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId,
        iteration: 2,
        stage: 'execution' as const,
        overallConfidence: 0.7,
      });

      const history = server.getMonitoringHistory(monitoringId);
      expect(history).toHaveLength(3);
      expect(history[0].iteration).toBe(0);
      expect(history[1].iteration).toBe(1);
      expect(history[2].iteration).toBe(2);
    });

    it('should maintain separate state for different monitoring sessions', () => {
      const monitoring1 = 'monitoring-alpha';
      const monitoring2 = 'monitoring-beta';

      // Add assessments to monitoring 1
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId: monitoring1,
        iteration: 0,
      });
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId: monitoring1,
        iteration: 1,
      });

      // Add assessments to monitoring 2
      server.processMetacognitiveMonitoring({
        ...validInput,
        monitoringId: monitoring2,
        iteration: 0,
      });

      const history1 = server.getMonitoringHistory(monitoring1);
      const history2 = server.getMonitoringHistory(monitoring2);

      expect(history1).toHaveLength(2);
      expect(history2).toHaveLength(1);
      expect(history1[0].monitoringId).toBe(monitoring1);
      expect(history2[0].monitoringId).toBe(monitoring2);
    });

    it('should return empty array for non-existent monitoring session', () => {
      const history = server.getMonitoringHistory('non-existent-monitoring');
      expect(history).toEqual([]);
    });

    describe('getConfidenceProgression', () => {
      it('should track confidence changes across assessments', () => {
        const monitoringId = 'confidence-progression-test';

        // Add multiple assessments with varying confidence
        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          stage: 'knowledge-assessment' as const,
          overallConfidence: 0.5,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 1,
          stage: 'planning' as const,
          overallConfidence: 0.6,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 2,
          stage: 'execution' as const,
          overallConfidence: 0.7,
        });

        const progression = server.getConfidenceProgression(monitoringId);

        expect(progression.monitoringId).toBe(monitoringId);
        expect(progression.totalAssessments).toBe(3);
        expect(progression.confidenceChanges).toHaveLength(3);

        // Verify confidence changes are tracked correctly
        expect(progression.confidenceChanges[0].iteration).toBe(0);
        expect(progression.confidenceChanges[0].stage).toBe('knowledge-assessment');
        expect(progression.confidenceChanges[0].overallConfidence).toBe(0.5);

        expect(progression.confidenceChanges[1].iteration).toBe(1);
        expect(progression.confidenceChanges[1].stage).toBe('planning');
        expect(progression.confidenceChanges[1].overallConfidence).toBe(0.6);

        expect(progression.confidenceChanges[2].iteration).toBe(2);
        expect(progression.confidenceChanges[2].stage).toBe('execution');
        expect(progression.confidenceChanges[2].overallConfidence).toBe(0.7);
      });

      it('should calculate average confidence correctly', () => {
        const monitoringId = 'average-confidence-test';

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          overallConfidence: 0.5,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 1,
          overallConfidence: 0.7,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 2,
          overallConfidence: 0.8,
        });

        const progression = server.getConfidenceProgression(monitoringId);

        // Average of 0.5, 0.7, 0.8 = 2.0 / 3 = 0.6666...
        expect(progression.averageConfidence).toBeCloseTo(0.6666666666666666, 5);
      });

      it('should identify increasing confidence trend', () => {
        const monitoringId = 'increasing-confidence-test';

        // Confidence increases from 0.4 to 0.7 (difference > 0.05 threshold)
        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          overallConfidence: 0.4,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 1,
          overallConfidence: 0.55,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 2,
          overallConfidence: 0.7,
        });

        const progression = server.getConfidenceProgression(monitoringId);
        expect(progression.confidenceTrend).toBe('increasing');
      });

      it('should identify decreasing confidence trend', () => {
        const monitoringId = 'decreasing-confidence-test';

        // Confidence decreases from 0.8 to 0.5 (difference < -0.05 threshold)
        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          overallConfidence: 0.8,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 1,
          overallConfidence: 0.65,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 2,
          overallConfidence: 0.5,
        });

        const progression = server.getConfidenceProgression(monitoringId);
        expect(progression.confidenceTrend).toBe('decreasing');
      });

      it('should identify stable confidence trend', () => {
        const monitoringId = 'stable-confidence-test';

        // Confidence changes from 0.6 to 0.62 (difference within 0.05 threshold)
        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          overallConfidence: 0.6,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 1,
          overallConfidence: 0.61,
        });

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 2,
          overallConfidence: 0.62,
        });

        const progression = server.getConfidenceProgression(monitoringId);
        expect(progression.confidenceTrend).toBe('stable');
      });

      it('should return null values for non-existent monitoring session', () => {
        const progression = server.getConfidenceProgression('non-existent');

        expect(progression.monitoringId).toBe('non-existent');
        expect(progression.totalAssessments).toBe(0);
        expect(progression.confidenceChanges).toEqual([]);
        expect(progression.averageConfidence).toBeNull();
        expect(progression.confidenceTrend).toBeNull();
      });

      it('should handle single assessment (no trend calculation)', () => {
        const monitoringId = 'single-assessment-test';

        server.processMetacognitiveMonitoring({
          ...validInput,
          monitoringId,
          iteration: 0,
          overallConfidence: 0.75,
        });

        const progression = server.getConfidenceProgression(monitoringId);

        expect(progression.totalAssessments).toBe(1);
        expect(progression.averageConfidence).toBe(0.75);
        expect(progression.confidenceTrend).toBeNull(); // Not enough data for trend
      });
    });

    it('should preserve all assessment data in monitoring history', () => {
      const monitoringId = 'data-preservation-test';

      const assessmentData = {
        ...validInput,
        monitoringId,
        iteration: 0,
        stage: 'knowledge-assessment' as const,
        overallConfidence: 0.7,
        uncertaintyAreas: ['Area 1', 'Area 2'],
        recommendedApproach: 'Test approach',
        nextAssessmentNeeded: true,
        suggestedAssessments: ['Assessment 1', 'Assessment 2'],
        knowledgeAssessment: {
          domain: 'Test Domain',
          knowledgeLevel: 'intermediate' as const,
          confidenceScore: 0.7,
          supportingEvidence: 'Test evidence',
          knownLimitations: ['Limitation 1', 'Limitation 2'],
        },
        claims: [
          {
            claim: 'Test claim',
            status: 'verified' as const,
            confidenceScore: 0.8,
            evidenceBasis: 'Test evidence',
            alternativeInterpretations: ['Alternative 1'],
          },
        ],
        reasoningSteps: [
          {
            step: 'Step 1',
            logicalValidity: 0.9,
            inferenceStrength: 0.85,
            assumptions: ['Assumption 1'],
            potentialBiases: ['Bias 1'],
          },
        ],
      };

      server.processMetacognitiveMonitoring(assessmentData);

      const history = server.getMonitoringHistory(monitoringId);
      expect(history).toHaveLength(1);

      const stored = history[0];
      expect(stored.task).toBe(assessmentData.task);
      expect(stored.stage).toBe(assessmentData.stage);
      expect(stored.monitoringId).toBe(assessmentData.monitoringId);
      expect(stored.iteration).toBe(assessmentData.iteration);
      expect(stored.overallConfidence).toBe(assessmentData.overallConfidence);
      expect(stored.uncertaintyAreas).toEqual(assessmentData.uncertaintyAreas);
      expect(stored.recommendedApproach).toBe(assessmentData.recommendedApproach);
      expect(stored.nextAssessmentNeeded).toBe(assessmentData.nextAssessmentNeeded);
      expect(stored.suggestedAssessments).toEqual(assessmentData.suggestedAssessments);
      expect(stored.knowledgeAssessment).toEqual(assessmentData.knowledgeAssessment);
      expect(stored.claims).toEqual(assessmentData.claims);
      expect(stored.reasoningSteps).toEqual(assessmentData.reasoningSteps);
    });
  });
});
