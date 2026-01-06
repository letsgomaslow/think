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

        expect(result.personas).toHaveLength(1);
        expect(result.personas[0].id).toBe('security-specialist');
        expect(result.personas[0].name).toBe('Security Specialist');
        expect(result.personas[0].expertise).toContain('threat modeling');
        expect(result.personas[0].category).toBe('technical');
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

        expect(result.personas).toHaveLength(3);
        expect(result.personas.map(p => p.id)).toContain('security-specialist');
        expect(result.personas.map(p => p.id)).toContain('performance-engineer');
        expect(result.personas.map(p => p.id)).toContain('ux-researcher');
      });

      it('should preserve enhanced persona metadata', () => {
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

        const persona = result.personas[0];
        expect(persona.category).toBe('technical');
        expect(persona.tags).toBeDefined();
        expect(persona.concerns).toBeDefined();
        expect(persona.typicalQuestions).toBeDefined();
      });

      it('should throw error for invalid predefined persona ID', () => {
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

        expect(() => server.processCollaborativeReasoning(input)).toThrow(
          /Failed to resolve predefined persona 'invalid-persona-id'/
        );
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

        expect(result.personas.length).toBeGreaterThan(0);
        result.personas.forEach(persona => {
          expect(persona.category).toBe('technical');
        });
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

        expect(result.personas.length).toBeGreaterThan(0);
        result.personas.forEach(persona => {
          expect(persona.category).toBe('business');
        });
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

        expect(result.personas.length).toBeGreaterThan(0);
        result.personas.forEach(persona => {
          expect(persona.category).toBe('creative');
        });
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

        expect(result.personas.length).toBeGreaterThan(0);
        result.personas.forEach(persona => {
          expect(persona.category).toBe('general');
        });
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

        expect(result.personas).toHaveLength(3);
        expect(result.personas.map(p => p.id)).toContain('security-specialist');
        expect(result.personas.map(p => p.id)).toContain('performance-engineer');
        expect(result.personas.map(p => p.id)).toContain('domain-expert');
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

        expect(result.personas).toHaveLength(2);
        const securityPersona = result.personas.find(p => p.id === 'security-specialist');
        expect(securityPersona?.name).toBe('Custom Security Expert');
        expect(securityPersona?.expertise).toEqual(['custom security']);
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

        expect(result.personas.length).toBeGreaterThan(1);
        expect(result.personas.map(p => p.id)).toContain('custom-expert');
        expect(result.personas.some(p => p.category === 'technical')).toBe(true);
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

        // Should have technical category personas + product-manager + custom-expert
        expect(result.personas.length).toBeGreaterThan(2);
        expect(result.personas.map(p => p.id)).toContain('product-manager');
        expect(result.personas.map(p => p.id)).toContain('custom-expert');
        expect(result.personas.some(p => p.category === 'technical')).toBe(true);
      });
    });

    describe('Backward Compatibility', () => {
      it('should work with only custom personas (legacy usage)', () => {
        const result = server.processCollaborativeReasoning(validInput);

        expect(result.personas).toHaveLength(1);
        expect(result.personas[0].id).toBe('security-expert');
        expect(result.personas[0].name).toBe('Security Expert');
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

        expect(result.personas).toHaveLength(1);
        expect(result.personas[0].id).toBe('legacy-expert');
        expect(result.personas[0].category).toBeUndefined();
      });

      it('should maintain all existing validation rules', () => {
        expect(() => server.processCollaborativeReasoning({
          topic: 'test',
        })).toThrow();

        expect(() => server.processCollaborativeReasoning({
          ...validInput,
          iteration: -1,
        })).toThrow();

        expect(() => server.processCollaborativeReasoning({
          ...validInput,
          nextContributionNeeded: 'invalid',
        })).toThrow();
      });
    });

    describe('Error Handling', () => {
      it('should throw error when no personas are provided', () => {
        const input = {
          topic: 'Test',
          contributions: [],
          stage: 'ideation' as const,
          activePersonaId: 'test',
          sessionId: 'session-1',
          iteration: 0,
          nextContributionNeeded: true,
        };

        expect(() => server.processCollaborativeReasoning(input)).toThrow(
          /No personas provided/
        );
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

        expect(result.personas).toHaveLength(1);
        expect(result.personas[0].id).toBe('custom');
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

        const securityPersonas = result.personas.filter(p => p.id === 'security-specialist');
        expect(securityPersonas).toHaveLength(1);
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist multiple contributions for the same session', () => {
      const sessionId = 'persistent-session-1';

      // First contribution
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId,
        iteration: 0,
      });

      // Second contribution
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId,
        iteration: 1,
      });

      // Third contribution
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId,
        iteration: 2,
      });

      const history = server.getSessionHistory(sessionId);
      expect(history).toHaveLength(3);
      expect(history[0].iteration).toBe(0);
      expect(history[1].iteration).toBe(1);
      expect(history[2].iteration).toBe(2);
    });

    it('should maintain separate state for different sessions', () => {
      const session1 = 'session-alpha';
      const session2 = 'session-beta';

      // Add contributions to session 1
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId: session1,
        iteration: 0,
      });
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId: session1,
        iteration: 1,
      });

      // Add contributions to session 2
      server.processCollaborativeReasoning({
        ...validInput,
        sessionId: session2,
        iteration: 0,
      });

      const history1 = server.getSessionHistory(session1);
      const history2 = server.getSessionHistory(session2);

      expect(history1).toHaveLength(2);
      expect(history2).toHaveLength(1);
      expect(history1[0].sessionId).toBe(session1);
      expect(history2[0].sessionId).toBe(session2);
    });

    it('should return empty array for non-existent session', () => {
      const history = server.getSessionHistory('non-existent-session');
      expect(history).toEqual([]);
    });

    describe('getSessionSummary', () => {
      it('should return correct summary for session with contributions', () => {
        const sessionId = 'summary-test-session';

        // Add multiple contributions with different stages
        server.processCollaborativeReasoning({
          ...validInput,
          sessionId,
          iteration: 0,
          stage: 'ideation' as const,
          activePersonaId: 'security-expert',
          contributions: [
            {
              personaId: 'security-expert',
              content: 'First contribution',
              type: 'suggestion' as const,
              confidence: 0.9,
            },
          ],
        });

        server.processCollaborativeReasoning({
          ...validInput,
          sessionId,
          iteration: 1,
          stage: 'critique' as const,
          activePersonaId: 'security-expert',
          contributions: [
            {
              personaId: 'security-expert',
              content: 'Second contribution',
              type: 'critique' as const,
              confidence: 0.8,
            },
            {
              personaId: 'security-expert',
              content: 'Third contribution',
              type: 'suggestion' as const,
              confidence: 0.7,
            },
          ],
        });

        const summary = server.getSessionSummary(sessionId);

        expect(summary.sessionId).toBe(sessionId);
        expect(summary.totalIterations).toBe(2);
        expect(summary.lastStage).toBe('critique');
        expect(summary.lastActivePersonaId).toBe('security-expert');
        expect(summary.lastIteration).toBe(1);
        expect(summary.totalContributions).toBe(3);
      });

      it('should return null values for non-existent session', () => {
        const summary = server.getSessionSummary('non-existent');

        expect(summary.sessionId).toBe('non-existent');
        expect(summary.totalIterations).toBe(0);
        expect(summary.lastStage).toBeNull();
        expect(summary.lastActivePersonaId).toBeNull();
        expect(summary.lastIteration).toBeNull();
        expect(summary.totalContributions).toBe(0);
      });

      it('should correctly count total contributions across all iterations', () => {
        const sessionId = 'contribution-count-test';

        // Iteration 0: 1 contribution
        server.processCollaborativeReasoning({
          ...validInput,
          sessionId,
          iteration: 0,
          contributions: [
            {
              personaId: 'security-expert',
              content: 'Single contribution',
              type: 'suggestion' as const,
              confidence: 0.9,
            },
          ],
        });

        // Iteration 1: 3 contributions
        server.processCollaborativeReasoning({
          ...validInput,
          sessionId,
          iteration: 1,
          contributions: [
            {
              personaId: 'security-expert',
              content: 'First',
              type: 'suggestion' as const,
              confidence: 0.9,
            },
            {
              personaId: 'security-expert',
              content: 'Second',
              type: 'critique' as const,
              confidence: 0.8,
            },
            {
              personaId: 'security-expert',
              content: 'Third',
              type: 'question' as const,
              confidence: 0.7,
            },
          ],
        });

        const summary = server.getSessionSummary(sessionId);
        expect(summary.totalContributions).toBe(4);
      });
    });

    it('should preserve all contribution data in session history', () => {
      const sessionId = 'data-preservation-test';

      const contributionData = {
        ...validInput,
        sessionId,
        iteration: 0,
        stage: 'ideation' as const,
        activePersonaId: 'security-expert',
        nextPersonaId: 'test-persona',
        consensusPoints: ['Point 1', 'Point 2'],
        keyInsights: ['Insight 1'],
        openQuestions: ['Question 1'],
        contributions: [
          {
            personaId: 'security-expert',
            content: 'Test contribution',
            type: 'suggestion' as const,
            confidence: 0.9,
          },
        ],
      };

      server.processCollaborativeReasoning(contributionData);

      const history = server.getSessionHistory(sessionId);
      expect(history).toHaveLength(1);

      const stored = history[0];
      expect(stored.topic).toBe(contributionData.topic);
      expect(stored.stage).toBe(contributionData.stage);
      expect(stored.activePersonaId).toBe(contributionData.activePersonaId);
      expect(stored.nextPersonaId).toBe(contributionData.nextPersonaId);
      expect(stored.consensusPoints).toEqual(contributionData.consensusPoints);
      expect(stored.keyInsights).toEqual(contributionData.keyInsights);
      expect(stored.openQuestions).toEqual(contributionData.openQuestions);
      expect(stored.contributions).toEqual(contributionData.contributions);
    });
  });
});
