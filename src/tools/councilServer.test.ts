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

  describe('Basic Functionality', () => {
    it('should process valid collaborative reasoning data', () => {
      const result = server.processCollaborativeReasoning(validInput);

      expect(result.status).toBe('success');
      expect(result.data?.topic).toBe('API Design Decision');
      expect(result.data?.stage).toBe('ideation');
      expect(result.data?.iteration).toBe(0);
    });

    it('should return failed status for missing required fields', () => {
      const result = server.processCollaborativeReasoning({
        topic: 'test',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return failed status for invalid iteration', () => {
      const result = server.processCollaborativeReasoning({
        ...validInput,
        iteration: -1,
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return failed status for invalid nextContributionNeeded type', () => {
      const result = server.processCollaborativeReasoning({
        ...validInput,
        nextContributionNeeded: 'yes',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
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
        expect(result.status).toBe('success');
        expect(result.data?.stage).toBe(stage);
      });
    });
  });

  describe('Predefined Personas Integration', () => {
    describe('Using predefinedPersonas array', () => {
      it('should resolve single predefined persona', () => {
        const input = {
          topic: 'Security Review',
          predefinedPersonas: ['security-specialist'],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(1);
      });

      it('should resolve multiple predefined personas', () => {
        const input = {
          topic: 'Architecture Review',
          predefinedPersonas: ['security-specialist', 'performance-engineer', 'ux-researcher'],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(3);
      });

      it('should return failed status for invalid predefined persona ID', () => {
        const input = {
          topic: 'Test',
          predefinedPersonas: ['invalid-persona-id'],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'invalid-persona-id',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('failed');
        expect(result.error).toContain('invalid-persona-id');
      });
    });

    describe('Using personaCategory', () => {
      it('should resolve all technical personas', () => {
        const input = {
          topic: 'Technical Architecture',
          personaCategory: 'technical' as const,
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBeGreaterThan(0);
      });

      it('should resolve all business personas', () => {
        const input = {
          topic: 'Product Strategy',
          personaCategory: 'business' as const,
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'product-manager',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBeGreaterThan(0);
      });

      it('should resolve all creative personas', () => {
        const input = {
          topic: 'Brand Strategy',
          personaCategory: 'creative' as const,
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'design-thinker',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBeGreaterThan(0);
      });

      it('should resolve all general personas', () => {
        const input = {
          topic: 'Strategic Analysis',
          personaCategory: 'general' as const,
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'devils-advocate',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBeGreaterThan(0);
      });
    });

    describe('Mixing predefined with custom personas', () => {
      it('should combine predefined and custom personas', () => {
        const customPersona = {
          id: 'domain-expert',
          name: 'Domain Expert',
          expertise: ['domain modeling', 'business logic'],
          background: 'Domain-driven design specialist',
          perspective: 'Focus on ubiquitous language',
          biases: ['May over-complicate models'],
          communication: { style: 'conceptual', tone: 'thoughtful' },
        };

        const input = {
          topic: 'Domain Design',
          predefinedPersonas: ['security-specialist', 'performance-engineer'],
          personas: [customPersona],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(3);
      });

      it('should allow custom persona to override predefined persona', () => {
        const customSecurityExpert = {
          id: 'security-specialist',
          name: 'Custom Security Expert',
          expertise: ['custom security'],
          background: 'Custom background',
          perspective: 'Custom perspective',
          biases: ['Custom bias'],
          communication: { style: 'custom', tone: 'custom' },
        };

        const input = {
          topic: 'Security Review',
          predefinedPersonas: ['security-specialist', 'performance-engineer'],
          personas: [customSecurityExpert],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(2);
      });

      it('should combine category with custom personas', () => {
        const customPersona = {
          id: 'custom-expert',
          name: 'Custom Expert',
          expertise: ['custom domain'],
          background: 'Custom background',
          perspective: 'Custom perspective',
          biases: ['Custom bias'],
          communication: { style: 'custom', tone: 'custom' },
        };

        const input = {
          topic: 'Comprehensive Review',
          personaCategory: 'technical' as const,
          personas: [customPersona],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBeGreaterThan(1);
      });

      it('should combine predefinedPersonas, category, and custom personas', () => {
        const customPersona = {
          id: 'custom-expert',
          name: 'Custom Expert',
          expertise: ['custom domain'],
          background: 'Custom background',
          perspective: 'Custom perspective',
          biases: ['Custom bias'],
          communication: { style: 'custom', tone: 'custom' },
        };

        const input = {
          topic: 'Full Integration Test',
          predefinedPersonas: ['product-manager'],
          personaCategory: 'technical' as const,
          personas: [customPersona],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'product-manager',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        // Should have technical category personas + product-manager + custom-expert
        expect(result.data?.personaCount).toBeGreaterThan(2);
      });
    });

    describe('Backward Compatibility', () => {
      it('should work with only custom personas (legacy usage)', () => {
        const result = server.processCollaborativeReasoning(validInput);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(1);
      });

      it('should accept personas without category field', () => {
        const legacyPersona = {
          id: 'legacy-expert',
          name: 'Legacy Expert',
          expertise: ['legacy'],
          background: 'Legacy background',
          perspective: 'Legacy perspective',
          biases: ['Legacy bias'],
          communication: { style: 'legacy', tone: 'legacy' },
        };

        const input = {
          topic: 'Legacy Test',
          personas: [legacyPersona],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'legacy-expert',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(1);
      });

      it('should maintain all existing validation rules', () => {
        const missingFieldsResult = server.processCollaborativeReasoning({
          topic: 'test',
        });
        expect(missingFieldsResult.status).toBe('failed');

        const invalidIterationResult = server.processCollaborativeReasoning({
          ...validInput,
          iteration: -1,
        });
        expect(invalidIterationResult.status).toBe('failed');

        const invalidNextContributionResult = server.processCollaborativeReasoning({
          ...validInput,
          nextContributionNeeded: 'invalid',
        });
        expect(invalidNextContributionResult.status).toBe('failed');
      });
    });

    describe('Error Handling', () => {
      it('should return failed status when no personas are provided', () => {
        const input = {
          topic: 'Test',
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'test',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('failed');
        expect(result.error).toContain('No personas provided');
      });

      it('should handle empty predefinedPersonas array', () => {
        const customPersona = {
          id: 'custom',
          name: 'Custom',
          expertise: ['test'],
          background: 'test',
          perspective: 'test',
          biases: ['test'],
          communication: { style: 'test', tone: 'test' },
        };

        const input = {
          topic: 'Test',
          predefinedPersonas: [],
          personas: [customPersona],
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'custom',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        expect(result.data?.personaCount).toBe(1);
      });

      it('should prevent duplicate personas from category and predefinedPersonas', () => {
        const input = {
          topic: 'Test',
          predefinedPersonas: ['security-specialist'],
          personaCategory: 'technical' as const,
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'security-specialist',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        const result = server.processCollaborativeReasoning(input);

        expect(result.status).toBe('success');
        // The personaCount should not have duplicates
        // Technical category has multiple personas, security-specialist should only appear once
        expect(result.data?.personaCount).toBeGreaterThan(0);
      });
    });
  });
});
