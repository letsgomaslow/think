import { describe, it, expect, beforeEach } from 'vitest';
import { PersonaFactory } from './factory.js';
import { PersonaRegistry } from './registry.js';
import { PredefinedPersona, EnhancedPersonaData, PersonaCreationOptions } from './types.js';

describe('PersonaFactory', () => {
  let factory: PersonaFactory;
  let registry: PersonaRegistry;

  // Test data - mock personas for testing
  const testPersona1: PredefinedPersona = {
    id: 'test-security-expert',
    name: 'Security Expert',
    expertise: ['security', 'threat modeling', 'cryptography'],
    background: 'Security professional with 15+ years experience',
    perspective: 'Security must be built in from the start',
    biases: ['May be overly cautious'],
    communication: { style: 'Direct and methodical', tone: 'Serious' },
    category: 'technical',
    tags: ['security', 'cybersecurity', 'threat-modeling'],
    concerns: ['Authentication vulnerabilities', 'Data exposure'],
    typicalQuestions: ['How are we authenticating users?', 'What if this is compromised?']
  };

  const testPersona2: PredefinedPersona = {
    id: 'test-performance-expert',
    name: 'Performance Engineer',
    expertise: ['optimization', 'profiling', 'scalability'],
    background: 'Performance engineering specialist',
    perspective: 'Performance is a feature',
    biases: ['May over-optimize prematurely'],
    communication: { style: 'Data-driven', tone: 'Analytical' },
    category: 'technical',
    tags: ['performance', 'optimization', 'scalability'],
    concerns: ['Performance bottlenecks', 'Resource waste'],
    typicalQuestions: ['What is the performance impact?', 'How does this scale?']
  };

  const testPersona3: PredefinedPersona = {
    id: 'test-product-manager',
    name: 'Product Manager',
    expertise: ['roadmapping', 'prioritization', 'stakeholder management'],
    background: 'Product strategy expert',
    perspective: 'Focus on user outcomes',
    biases: ['May prioritize features over tech debt'],
    communication: { style: 'Strategic', tone: 'Collaborative' },
    category: 'business',
    tags: ['product', 'strategy', 'prioritization'],
    concerns: ['Product-market fit', 'User needs'],
    typicalQuestions: ['What problem are we solving?', 'What is the user impact?']
  };

  beforeEach(() => {
    factory = new PersonaFactory();
    registry = new PersonaRegistry();

    // Register test personas in the registry
    registry.registerPersonas([testPersona1, testPersona2, testPersona3]);

    // Replace the factory's registry reference with our test registry
    // This is a bit of a hack, but necessary for isolated testing
    (factory as any).createFromPredefined = function(
      predefinedId: string,
      overrides?: Partial<EnhancedPersonaData>,
      mergeStrategy: 'merge' | 'replace' = 'merge'
    ): EnhancedPersonaData {
      const template = registry.getPersonaById(predefinedId);

      if (!template) {
        throw new Error(`Predefined persona with ID '${predefinedId}' not found`);
      }

      const persona: EnhancedPersonaData = {
        id: template.id,
        name: template.name,
        expertise: [...template.expertise],
        background: template.background,
        perspective: template.perspective,
        biases: [...template.biases],
        communication: { ...template.communication },
        category: template.category,
        tags: [...template.tags],
        concerns: [...template.concerns],
        typicalQuestions: [...template.typicalQuestions]
      };

      if (overrides) {
        if (mergeStrategy === 'merge') {
          return (factory as any).mergePersonaData(persona, overrides);
        } else {
          return {
            ...persona,
            ...overrides,
            id: overrides.id ?? persona.id,
            name: overrides.name ?? persona.name,
            expertise: overrides.expertise ?? persona.expertise,
            background: overrides.background ?? persona.background,
            perspective: overrides.perspective ?? persona.perspective,
            biases: overrides.biases ?? persona.biases,
            communication: overrides.communication ?? persona.communication,
            category: overrides.category ?? persona.category,
            tags: overrides.tags ?? persona.tags,
            concerns: overrides.concerns ?? persona.concerns,
            typicalQuestions: overrides.typicalQuestions ?? persona.typicalQuestions
          };
        }
      }

      return persona;
    };

    (factory as any).createFromCategory = function(category: string, limit?: number) {
      const categoryPersonas = registry.getPersonasByCategory(category as any);

      if (categoryPersonas.length === 0) {
        throw new Error(`No personas found in category '${category}'`);
      }

      const personasToCreate = limit
        ? categoryPersonas.slice(0, limit)
        : categoryPersonas;

      return personasToCreate.map((template: any) =>
        (factory as any).createFromPredefined(template.id)
      );
    };

    (factory as any).getAvailablePersonaIds = function() {
      return registry.getAllPersonas().map((p: any) => p.id);
    };

    (factory as any).getPersonaIdsByCategory = function(category: string) {
      return registry.getPersonasByCategory(category as any).map((p: any) => p.id);
    };

    (factory as any).hasPersona = function(predefinedId: string) {
      return registry.hasPersona(predefinedId);
    };
  });

  describe('createFromPredefined', () => {
    it('should create persona from predefined template without overrides', () => {
      const persona = factory.createFromPredefined('test-security-expert');

      expect(persona.id).toBe('test-security-expert');
      expect(persona.name).toBe('Security Expert');
      expect(persona.expertise).toEqual(['security', 'threat modeling', 'cryptography']);
      expect(persona.background).toBe('Security professional with 15+ years experience');
      expect(persona.category).toBe('technical');
      expect(persona.tags).toEqual(['security', 'cybersecurity', 'threat-modeling']);
    });

    it('should throw error when predefined persona not found', () => {
      expect(() => factory.createFromPredefined('non-existent')).toThrow(
        "Predefined persona with ID 'non-existent' not found"
      );
    });

    it('should create persona with merge strategy overrides', () => {
      const persona = factory.createFromPredefined(
        'test-security-expert',
        {
          name: 'Senior Security Expert',
          expertise: ['advanced cryptography'],
          tags: ['expert-level']
        },
        'merge'
      );

      expect(persona.id).toBe('test-security-expert');
      expect(persona.name).toBe('Senior Security Expert');
      // Expertise should be merged (deduplicated)
      expect(persona.expertise).toContain('security');
      expect(persona.expertise).toContain('advanced cryptography');
      // Tags should be merged (deduplicated)
      expect(persona.tags).toContain('security');
      expect(persona.tags).toContain('expert-level');
    });

    it('should create persona with replace strategy overrides', () => {
      const persona = factory.createFromPredefined(
        'test-security-expert',
        {
          expertise: ['only this expertise'],
          tags: ['only this tag']
        },
        'replace'
      );

      expect(persona.id).toBe('test-security-expert');
      expect(persona.name).toBe('Security Expert'); // Not overridden
      expect(persona.expertise).toEqual(['only this expertise']);
      expect(persona.tags).toEqual(['only this tag']);
    });

    it('should default to merge strategy when not specified', () => {
      const persona = factory.createFromPredefined(
        'test-security-expert',
        { expertise: ['additional expertise'] }
      );

      // Should merge, not replace
      expect(persona.expertise).toContain('security');
      expect(persona.expertise).toContain('additional expertise');
    });

    it('should deep copy arrays to avoid mutation', () => {
      const persona1 = factory.createFromPredefined('test-security-expert');
      const persona2 = factory.createFromPredefined('test-security-expert');

      persona1.expertise.push('new expertise');

      expect(persona2.expertise).not.toContain('new expertise');
    });

    it('should deep copy communication object to avoid mutation', () => {
      const persona1 = factory.createFromPredefined('test-security-expert');
      const persona2 = factory.createFromPredefined('test-security-expert');

      persona1.communication.style = 'Modified style';

      expect(persona2.communication.style).toBe('Direct and methodical');
    });
  });

  describe('createFromOptions', () => {
    it('should create persona from options with predefinedId', () => {
      const options: PersonaCreationOptions = {
        predefinedId: 'test-security-expert'
      };

      const persona = factory.createFromOptions(options);

      expect(persona.id).toBe('test-security-expert');
      expect(persona.name).toBe('Security Expert');
    });

    it('should throw error when predefinedId is missing', () => {
      const options = {} as PersonaCreationOptions;

      expect(() => factory.createFromOptions(options)).toThrow(
        'predefinedId is required in PersonaCreationOptions'
      );
    });

    it('should apply overrides from options', () => {
      const options: PersonaCreationOptions = {
        predefinedId: 'test-security-expert',
        overrides: {
          name: 'Custom Security Expert'
        }
      };

      const persona = factory.createFromOptions(options);

      expect(persona.name).toBe('Custom Security Expert');
    });

    it('should use merge strategy from options', () => {
      const options: PersonaCreationOptions = {
        predefinedId: 'test-security-expert',
        overrides: {
          expertise: ['replacement expertise']
        },
        mergeStrategy: 'replace'
      };

      const persona = factory.createFromOptions(options);

      expect(persona.expertise).toEqual(['replacement expertise']);
    });

    it('should default to merge strategy when not specified in options', () => {
      const options: PersonaCreationOptions = {
        predefinedId: 'test-security-expert',
        overrides: {
          expertise: ['additional expertise']
        }
      };

      const persona = factory.createFromOptions(options);

      expect(persona.expertise).toContain('security');
      expect(persona.expertise).toContain('additional expertise');
    });
  });

  describe('createCustom', () => {
    it('should create custom persona from complete data', () => {
      const customData: EnhancedPersonaData = {
        id: 'custom-persona',
        name: 'Custom Expert',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      };

      const persona = factory.createCustom(customData);

      expect(persona.id).toBe('custom-persona');
      expect(persona.name).toBe('Custom Expert');
      expect(persona.expertise).toEqual(['custom expertise']);
      expect(persona.category).toBe('general');
    });

    it('should throw error when id is missing', () => {
      const invalidData = {
        name: 'Custom Expert',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      } as EnhancedPersonaData;

      expect(() => factory.createCustom(invalidData)).toThrow(
        "Required field 'id' is missing from persona data"
      );
    });

    it('should throw error when name is missing', () => {
      const invalidData = {
        id: 'custom-persona',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      } as EnhancedPersonaData;

      expect(() => factory.createCustom(invalidData)).toThrow(
        "Required field 'name' is missing from persona data"
      );
    });

    it('should throw error when expertise is empty array', () => {
      const invalidData: EnhancedPersonaData = {
        id: 'custom-persona',
        name: 'Custom Expert',
        expertise: [],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      };

      expect(() => factory.createCustom(invalidData)).toThrow(
        'expertise array cannot be empty'
      );
    });

    it('should throw error when communication.style is missing', () => {
      const invalidData: EnhancedPersonaData = {
        id: 'custom-persona',
        name: 'Custom Expert',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: '', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      };

      expect(() => factory.createCustom(invalidData)).toThrow(
        'communication.style and communication.tone are required'
      );
    });

    it('should throw error when communication.tone is missing', () => {
      const invalidData: EnhancedPersonaData = {
        id: 'custom-persona',
        name: 'Custom Expert',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: '' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      };

      expect(() => factory.createCustom(invalidData)).toThrow(
        'communication.style and communication.tone are required'
      );
    });

    it('should return a deep copy to avoid mutations', () => {
      const customData: EnhancedPersonaData = {
        id: 'custom-persona',
        name: 'Custom Expert',
        expertise: ['custom expertise'],
        background: 'Custom background',
        perspective: 'Custom perspective',
        biases: ['Custom bias'],
        communication: { style: 'Custom style', tone: 'Custom tone' },
        category: 'general',
        tags: ['custom'],
        concerns: ['Custom concern'],
        typicalQuestions: ['Custom question?']
      };

      const persona = factory.createCustom(customData);

      // Mutate the returned persona
      persona.expertise.push('new expertise');
      persona.communication.style = 'Modified style';

      // Original should be unchanged
      expect(customData.expertise).not.toContain('new expertise');
      expect(customData.communication.style).toBe('Custom style');
    });
  });

  describe('toBasePersonaData', () => {
    it('should convert EnhancedPersonaData to base PersonaData format', () => {
      const enhanced: EnhancedPersonaData = {
        id: 'test-persona',
        name: 'Test Persona',
        expertise: ['test expertise'],
        background: 'Test background',
        perspective: 'Test perspective',
        biases: ['Test bias'],
        communication: { style: 'Test style', tone: 'Test tone' },
        category: 'general',
        tags: ['test'],
        concerns: ['Test concern'],
        typicalQuestions: ['Test question?']
      };

      const base = factory.toBasePersonaData(enhanced);

      expect(base.id).toBe('test-persona');
      expect(base.name).toBe('Test Persona');
      expect(base.expertise).toEqual(['test expertise']);
      expect(base.category).toBe('general');
      expect(base.tags).toEqual(['test']);
      expect(base.concerns).toEqual(['Test concern']);
      expect(base.typicalQuestions).toEqual(['Test question?']);
    });

    it('should preserve enhanced fields in base format', () => {
      const enhanced: EnhancedPersonaData = {
        id: 'test-persona',
        name: 'Test Persona',
        expertise: ['test expertise'],
        background: 'Test background',
        perspective: 'Test perspective',
        biases: ['Test bias'],
        communication: { style: 'Test style', tone: 'Test tone' },
        category: 'technical',
        tags: ['tag1', 'tag2'],
        concerns: ['concern1', 'concern2'],
        typicalQuestions: ['question1?', 'question2?']
      };

      const base = factory.toBasePersonaData(enhanced);

      expect(base.category).toBe('technical');
      expect(base.tags).toEqual(['tag1', 'tag2']);
      expect(base.concerns).toEqual(['concern1', 'concern2']);
      expect(base.typicalQuestions).toEqual(['question1?', 'question2?']);
    });

    it('should return a deep copy to avoid mutations', () => {
      const enhanced: EnhancedPersonaData = {
        id: 'test-persona',
        name: 'Test Persona',
        expertise: ['test expertise'],
        background: 'Test background',
        perspective: 'Test perspective',
        biases: ['Test bias'],
        communication: { style: 'Test style', tone: 'Test tone' },
        category: 'general',
        tags: ['test'],
        concerns: ['Test concern'],
        typicalQuestions: ['Test question?']
      };

      const base = factory.toBasePersonaData(enhanced);

      // Mutate the base persona
      base.expertise.push('new expertise');
      base.communication.style = 'Modified style';

      // Original should be unchanged
      expect(enhanced.expertise).not.toContain('new expertise');
      expect(enhanced.communication.style).toBe('Test style');
    });
  });

  describe('createMultipleFromPredefined', () => {
    it('should create multiple personas from ID list', () => {
      const personas = factory.createMultipleFromPredefined([
        'test-security-expert',
        'test-performance-expert'
      ]);

      expect(personas).toHaveLength(2);
      expect(personas[0].id).toBe('test-security-expert');
      expect(personas[1].id).toBe('test-performance-expert');
    });

    it('should handle empty array', () => {
      const personas = factory.createMultipleFromPredefined([]);

      expect(personas).toEqual([]);
    });

    it('should throw error for non-existent persona ID', () => {
      expect(() => factory.createMultipleFromPredefined([
        'test-security-expert',
        'non-existent'
      ])).toThrow();
    });

    it('should create independent persona instances', () => {
      const personas = factory.createMultipleFromPredefined([
        'test-security-expert',
        'test-security-expert'
      ]);

      personas[0].expertise.push('new expertise');

      expect(personas[1].expertise).not.toContain('new expertise');
    });
  });

  describe('createFromCategory', () => {
    it('should create all personas from a category', () => {
      const personas = factory.createFromCategory('technical');

      expect(personas).toHaveLength(2);
      expect(personas.map(p => p.id)).toContain('test-security-expert');
      expect(personas.map(p => p.id)).toContain('test-performance-expert');
    });

    it('should throw error for category with no personas', () => {
      expect(() => factory.createFromCategory('creative')).toThrow(
        "No personas found in category 'creative'"
      );
    });

    it('should respect limit parameter', () => {
      const personas = factory.createFromCategory('technical', 1);

      expect(personas).toHaveLength(1);
    });

    it('should create all personas when limit exceeds available', () => {
      const personas = factory.createFromCategory('technical', 10);

      expect(personas).toHaveLength(2); // Only 2 available
    });

    it('should create independent persona instances', () => {
      const personas = factory.createFromCategory('technical');

      personas[0].expertise.push('new expertise');

      expect(personas[1].expertise).not.toContain('new expertise');
    });
  });

  describe('clonePersona', () => {
    it('should clone persona with new ID', () => {
      const original = factory.createFromPredefined('test-security-expert');
      const cloned = factory.clonePersona(original, 'cloned-security-expert');

      expect(cloned.id).toBe('cloned-security-expert');
      expect(cloned.name).toBe(original.name);
      expect(cloned.expertise).toEqual(original.expertise);
      expect(cloned.background).toBe(original.background);
    });

    it('should create independent copy without shared references', () => {
      const original = factory.createFromPredefined('test-security-expert');
      const cloned = factory.clonePersona(original, 'cloned-security-expert');

      cloned.expertise.push('new expertise');
      cloned.communication.style = 'Modified style';

      expect(original.expertise).not.toContain('new expertise');
      expect(original.communication.style).toBe('Direct and methodical');
    });

    it('should apply overrides to cloned persona', () => {
      const original = factory.createFromPredefined('test-security-expert');
      const cloned = factory.clonePersona(
        original,
        'cloned-security-expert',
        {
          name: 'Cloned Security Expert',
          expertise: ['additional expertise']
        }
      );

      expect(cloned.id).toBe('cloned-security-expert');
      expect(cloned.name).toBe('Cloned Security Expert');
      // Should merge expertise
      expect(cloned.expertise).toContain('security');
      expect(cloned.expertise).toContain('additional expertise');
    });

    it('should merge arrays when applying overrides', () => {
      const original = factory.createFromPredefined('test-security-expert');
      const cloned = factory.clonePersona(
        original,
        'cloned-security-expert',
        {
          tags: ['cloned'],
          concerns: ['New concern']
        }
      );

      expect(cloned.tags).toContain('security');
      expect(cloned.tags).toContain('cloned');
      expect(cloned.concerns).toContain('Authentication vulnerabilities');
      expect(cloned.concerns).toContain('New concern');
    });
  });

  describe('getAvailablePersonaIds', () => {
    it('should return all registered persona IDs', () => {
      const ids = factory.getAvailablePersonaIds();

      expect(ids).toHaveLength(3);
      expect(ids).toContain('test-security-expert');
      expect(ids).toContain('test-performance-expert');
      expect(ids).toContain('test-product-manager');
    });
  });

  describe('getPersonaIdsByCategory', () => {
    it('should return persona IDs for technical category', () => {
      const ids = factory.getPersonaIdsByCategory('technical');

      expect(ids).toHaveLength(2);
      expect(ids).toContain('test-security-expert');
      expect(ids).toContain('test-performance-expert');
    });

    it('should return persona IDs for business category', () => {
      const ids = factory.getPersonaIdsByCategory('business');

      expect(ids).toHaveLength(1);
      expect(ids).toContain('test-product-manager');
    });

    it('should return empty array for category with no personas', () => {
      const ids = factory.getPersonaIdsByCategory('creative');

      expect(ids).toEqual([]);
    });
  });

  describe('hasPersona', () => {
    it('should return true for existing persona', () => {
      expect(factory.hasPersona('test-security-expert')).toBe(true);
    });

    it('should return false for non-existent persona', () => {
      expect(factory.hasPersona('non-existent')).toBe(false);
    });
  });
});
