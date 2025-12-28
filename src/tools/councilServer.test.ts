import { describe, it, expect, beforeEach } from 'vitest';
import { CouncilServer } from './councilServer.js';

describe('CouncilServer', () => {
  let server: CouncilServer;

  beforeEach(() => {
    server = new CouncilServer();
  });

  const validInput = {
    topic: 'API Design Decision',
    personas: [
      {
        id: 'security-expert',
        name: 'Security Expert',
        expertise: ['security', 'authentication'],
        background: 'Security consultant',
        perspective: 'Security-first approach',
        biases: ['May over-engineer security'],
        communication: { style: 'formal', tone: 'cautious' },
      },
    ],
    contributions: [
      {
        personaId: 'security-expert',
        content: 'We should use OAuth 2.0',
        type: 'suggestion' as const,
        confidence: 0.9,
      },
    ],
    stage: 'ideation' as const,
    activePersonaId: 'security-expert',
    sessionId: 'session-1',
    iteration: 0,
    nextContributionNeeded: true,
  };

  it('should process valid collaborative reasoning data', () => {
    const result = server.processCollaborativeReasoning(validInput);

    expect(result.topic).toBe('API Design Decision');
    expect(result.stage).toBe('ideation');
    expect(result.iteration).toBe(0);
  });

  it('should reject missing required fields', () => {
    expect(() => server.processCollaborativeReasoning({
      topic: 'test',
    })).toThrow();
  });

  it('should reject invalid iteration', () => {
    expect(() => server.processCollaborativeReasoning({
      ...validInput,
      iteration: -1,
    })).toThrow();
  });

  it('should reject invalid nextContributionNeeded type', () => {
    expect(() => server.processCollaborativeReasoning({
      ...validInput,
      nextContributionNeeded: 'yes',
    })).toThrow();
  });

  it('should handle all stage types', () => {
    const stages = [
      'problem-definition',
      'ideation',
      'critique',
      'integration',
      'decision',
      'reflection',
    ] as const;

    stages.forEach(stage => {
      const result = server.processCollaborativeReasoning({
        ...validInput,
        stage,
      });
      expect(result.stage).toBe(stage);
    });
  });
});
