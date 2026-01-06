import { describe, it, expect, beforeEach } from 'vitest';
import { PersonaRegistry } from './registry.js';
import { PredefinedPersona, PersonaCategory, PersonaCategoryId } from './types.js';

describe('PersonaRegistry', () => {
  let registry: PersonaRegistry;

  // Test data - mock personas
  const testCategory: PersonaCategory = {
    id: 'technical',
    name: 'Technical Experts',
    description: 'Technical domain experts',
    keywords: ['technical', 'engineering', 'architecture']
  };

  const testPersona1: PredefinedPersona = {
    id: 'security-expert',
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
    id: 'performance-expert',
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
    id: 'product-manager',
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
    registry = new PersonaRegistry();
  });

  describe('initialization', () => {
    it('should initialize with empty registry', () => {
      expect(registry.getPersonaCount()).toBe(0);
      expect(registry.getCategoryCount()).toBe(0);
      expect(registry.getAllPersonas()).toEqual([]);
      expect(registry.getAllCategories()).toEqual([]);
    });

    it('should have default version and lastUpdated', () => {
      const library = registry.getLibrary();
      expect(library.version).toBe('1.0.0');
      expect(library.lastUpdated).toBeTruthy();
    });
  });

  describe('registerCategory', () => {
    it('should register a category', () => {
      registry.registerCategory(testCategory);
      expect(registry.getCategoryCount()).toBe(1);
      expect(registry.hasCategory('technical')).toBe(true);
    });

    it('should retrieve registered category by ID', () => {
      registry.registerCategory(testCategory);
      const retrieved = registry.getCategoryById('technical');
      expect(retrieved).toEqual(testCategory);
    });

    it('should initialize empty persona list for category', () => {
      registry.registerCategory(testCategory);
      const personas = registry.getPersonasByCategory('technical');
      expect(personas).toEqual([]);
    });

    it('should allow registering multiple categories', () => {
      const category2: PersonaCategory = {
        id: 'business',
        name: 'Business Experts',
        description: 'Business domain experts',
        keywords: ['business', 'strategy']
      };

      registry.registerCategory(testCategory);
      registry.registerCategory(category2);

      expect(registry.getCategoryCount()).toBe(2);
      expect(registry.getAllCategories()).toHaveLength(2);
    });
  });

  describe('registerPersona', () => {
    it('should register a persona', () => {
      registry.registerPersona(testPersona1);
      expect(registry.getPersonaCount()).toBe(1);
      expect(registry.hasPersona('security-expert')).toBe(true);
    });

    it('should throw error when persona has no id', () => {
      const invalidPersona = { ...testPersona1, id: '' };
      expect(() => registry.registerPersona(invalidPersona)).toThrow('Persona must have an id');
    });

    it('should throw error when persona has no category', () => {
      const invalidPersona = { ...testPersona1, category: '' as PersonaCategoryId };
      expect(() => registry.registerPersona(invalidPersona)).toThrow('Persona must have a category');
    });

    it('should add persona to category index', () => {
      registry.registerPersona(testPersona1);
      const categoryPersonas = registry.getPersonasByCategory('technical');
      expect(categoryPersonas).toHaveLength(1);
      expect(categoryPersonas[0].id).toBe('security-expert');
    });

    it('should not duplicate persona in category index', () => {
      registry.registerPersona(testPersona1);
      registry.registerPersona(testPersona1); // Register same persona again
      const categoryPersonas = registry.getPersonasByCategory('technical');
      expect(categoryPersonas).toHaveLength(1);
    });

    it('should update lastUpdated timestamp', () => {
      const library1 = registry.getLibrary();
      const timestamp1 = library1.lastUpdated;

      // Small delay to ensure timestamp difference
      setTimeout(() => {
        registry.registerPersona(testPersona1);
        const library2 = registry.getLibrary();
        const timestamp2 = library2.lastUpdated;
        expect(timestamp2).not.toBe(timestamp1);
      }, 10);
    });
  });

  describe('registerPersonas', () => {
    it('should register multiple personas', () => {
      registry.registerPersonas([testPersona1, testPersona2]);
      expect(registry.getPersonaCount()).toBe(2);
      expect(registry.hasPersona('security-expert')).toBe(true);
      expect(registry.hasPersona('performance-expert')).toBe(true);
    });

    it('should handle empty array', () => {
      registry.registerPersonas([]);
      expect(registry.getPersonaCount()).toBe(0);
    });

    it('should register personas from different categories', () => {
      registry.registerPersonas([testPersona1, testPersona3]);
      expect(registry.getPersonaCount()).toBe(2);
      expect(registry.getPersonasByCategory('technical')).toHaveLength(1);
      expect(registry.getPersonasByCategory('business')).toHaveLength(1);
    });
  });

  describe('getPersonaById', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2]);
    });

    it('should retrieve persona by ID', () => {
      const persona = registry.getPersonaById('security-expert');
      expect(persona).toEqual(testPersona1);
    });

    it('should return undefined for non-existent ID', () => {
      const persona = registry.getPersonaById('non-existent');
      expect(persona).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const persona = registry.getPersonaById('SECURITY-EXPERT');
      expect(persona).toBeUndefined();
    });
  });

  describe('getPersonasByCategory', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should retrieve all personas in a category', () => {
      const technical = registry.getPersonasByCategory('technical');
      expect(technical).toHaveLength(2);
      expect(technical.map(p => p.id)).toContain('security-expert');
      expect(technical.map(p => p.id)).toContain('performance-expert');
    });

    it('should return empty array for category with no personas', () => {
      const creative = registry.getPersonasByCategory('creative');
      expect(creative).toEqual([]);
    });

    it('should not include personas from other categories', () => {
      const business = registry.getPersonasByCategory('business');
      expect(business).toHaveLength(1);
      expect(business[0].id).toBe('product-manager');
    });
  });

  describe('getPersonasByExpertise', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should find personas by exact expertise match', () => {
      const personas = registry.getPersonasByExpertise(['security']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should find personas by partial expertise match', () => {
      const personas = registry.getPersonasByExpertise(['threat']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should find personas with any of multiple expertise areas', () => {
      const personas = registry.getPersonasByExpertise(['security', 'optimization']);
      expect(personas).toHaveLength(2);
      expect(personas.map(p => p.id)).toContain('security-expert');
      expect(personas.map(p => p.id)).toContain('performance-expert');
    });

    it('should be case-insensitive', () => {
      const personas = registry.getPersonasByExpertise(['SECURITY']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should return empty array when no matches', () => {
      const personas = registry.getPersonasByExpertise(['nonexistent']);
      expect(personas).toEqual([]);
    });
  });

  describe('getPersonasByTags', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should find personas by exact tag match', () => {
      const personas = registry.getPersonasByTags(['security']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should find personas by partial tag match', () => {
      const personas = registry.getPersonasByTags(['cyber']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should find personas with any of multiple tags', () => {
      const personas = registry.getPersonasByTags(['security', 'performance']);
      expect(personas).toHaveLength(2);
    });

    it('should be case-insensitive', () => {
      const personas = registry.getPersonasByTags(['SECURITY']);
      expect(personas).toHaveLength(1);
    });

    it('should return empty array when no matches', () => {
      const personas = registry.getPersonasByTags(['nonexistent']);
      expect(personas).toEqual([]);
    });
  });

  describe('searchByKeywords', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should search in persona name', () => {
      const personas = registry.searchByKeywords(['Security']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should search in persona background', () => {
      const personas = registry.searchByKeywords(['professional']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('security-expert');
    });

    it('should search in persona perspective', () => {
      const personas = registry.searchByKeywords(['feature']);
      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('performance-expert');
    });

    it('should be case-insensitive', () => {
      const personas = registry.searchByKeywords(['SECURITY']);
      expect(personas).toHaveLength(1);
    });

    it('should find personas matching any keyword', () => {
      const personas = registry.searchByKeywords(['security', 'product']);
      expect(personas.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('queryPersonas', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should filter by category', () => {
      const results = registry.queryPersonas({ category: 'technical' });
      expect(results).toHaveLength(2);
    });

    it('should filter by expertise', () => {
      const results = registry.queryPersonas({ expertise: ['security'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-expert');
    });

    it('should filter by tags', () => {
      const results = registry.queryPersonas({ tags: ['security'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-expert');
    });

    it('should filter by keywords', () => {
      const results = registry.queryPersonas({ keywords: ['professional'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-expert');
    });

    it('should combine multiple filters (AND logic)', () => {
      const results = registry.queryPersonas({
        category: 'technical',
        expertise: ['security']
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-expert');
    });

    it('should respect limit parameter', () => {
      const results = registry.queryPersonas({ limit: 1 });
      expect(results).toHaveLength(1);
    });

    it('should return all personas when no filters', () => {
      const results = registry.queryPersonas({});
      expect(results).toHaveLength(3);
    });
  });

  describe('searchPersonas', () => {
    beforeEach(() => {
      registry.registerPersonas([testPersona1, testPersona2, testPersona3]);
    });

    it('should return search results with relevance scores', () => {
      const results = registry.searchPersonas({ category: 'technical' });
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('persona');
      expect(results[0]).toHaveProperty('relevance');
      expect(results[0]).toHaveProperty('matchReason');
    });

    it('should score category matches higher', () => {
      const results = registry.searchPersonas({ category: 'technical' });
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].matchReason).toContain('technical category');
    });

    it('should score expertise matches', () => {
      const results = registry.searchPersonas({ expertise: ['security'] });
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].matchReason).toContain('expertise');
    });

    it('should score tag matches', () => {
      const results = registry.searchPersonas({ tags: ['security'] });
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].matchReason).toContain('tagged as');
    });

    it('should score keyword matches', () => {
      const results = registry.searchPersonas({ keywords: ['professional'] });
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].matchReason).toContain('keywords');
    });

    it('should sort results by relevance (highest first)', () => {
      const results = registry.searchPersonas({
        category: 'technical',
        expertise: ['security']
      });
      expect(results.length).toBeGreaterThan(0);

      // Check that results are sorted in descending order
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevance).toBeGreaterThanOrEqual(results[i + 1].relevance);
      }
    });

    it('should cap relevance at 1.0', () => {
      const results = registry.searchPersonas({
        category: 'technical',
        expertise: ['security'],
        tags: ['security'],
        keywords: ['security']
      });
      expect(results[0].relevance).toBeLessThanOrEqual(1.0);
    });

    it('should provide general match when no specific criteria met', () => {
      const results = registry.searchPersonas({});
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.relevance).toBeGreaterThan(0);
      });
    });
  });

  describe('getLibrary', () => {
    beforeEach(() => {
      registry.registerCategory(testCategory);
      registry.registerPersonas([testPersona1, testPersona2]);
    });

    it('should return complete library structure', () => {
      const library = registry.getLibrary();
      expect(library).toHaveProperty('categories');
      expect(library).toHaveProperty('personas');
      expect(library).toHaveProperty('version');
      expect(library).toHaveProperty('lastUpdated');
    });

    it('should include all categories', () => {
      const library = registry.getLibrary();
      expect(library.categories).toHaveLength(1);
      expect(library.categories[0].id).toBe('technical');
    });

    it('should include all personas', () => {
      const library = registry.getLibrary();
      expect(library.personas).toHaveLength(2);
    });

    it('should have correct version', () => {
      const library = registry.getLibrary();
      expect(library.version).toBe('1.0.0');
    });

    it('should have valid lastUpdated timestamp', () => {
      const library = registry.getLibrary();
      expect(library.lastUpdated).toBeTruthy();
      expect(new Date(library.lastUpdated).getTime()).not.toBeNaN();
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      registry.registerCategory(testCategory);
      registry.registerPersonas([testPersona1, testPersona2]);
    });

    it('getPersonaCount should return correct count', () => {
      expect(registry.getPersonaCount()).toBe(2);
    });

    it('getCategoryCount should return correct count', () => {
      expect(registry.getCategoryCount()).toBe(1);
    });

    it('hasPersona should return true for existing persona', () => {
      expect(registry.hasPersona('security-expert')).toBe(true);
    });

    it('hasPersona should return false for non-existent persona', () => {
      expect(registry.hasPersona('non-existent')).toBe(false);
    });

    it('hasCategory should return true for existing category', () => {
      expect(registry.hasCategory('technical')).toBe(true);
    });

    it('hasCategory should return false for non-existent category', () => {
      expect(registry.hasCategory('creative')).toBe(false);
    });

    it('getAllPersonas should return all registered personas', () => {
      const all = registry.getAllPersonas();
      expect(all).toHaveLength(2);
      expect(all.map(p => p.id)).toContain('security-expert');
      expect(all.map(p => p.id)).toContain('performance-expert');
    });

    it('getAllCategories should return all registered categories', () => {
      const all = registry.getAllCategories();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('technical');
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      registry.registerCategory(testCategory);
      registry.registerPersonas([testPersona1, testPersona2]);
    });

    it('should clear all personas', () => {
      registry.clear();
      expect(registry.getPersonaCount()).toBe(0);
      expect(registry.getAllPersonas()).toEqual([]);
    });

    it('should clear all categories', () => {
      registry.clear();
      expect(registry.getCategoryCount()).toBe(0);
      expect(registry.getAllCategories()).toEqual([]);
    });

    it('should clear category index', () => {
      registry.clear();
      const personas = registry.getPersonasByCategory('technical');
      expect(personas).toEqual([]);
    });

    it('should update lastUpdated timestamp', () => {
      const library1 = registry.getLibrary();
      const timestamp1 = library1.lastUpdated;

      setTimeout(() => {
        registry.clear();
        const library2 = registry.getLibrary();
        const timestamp2 = library2.lastUpdated;
        expect(timestamp2).not.toBe(timestamp1);
      }, 10);
    });

    it('should allow re-registering after clear', () => {
      registry.clear();
      registry.registerPersona(testPersona1);
      expect(registry.getPersonaCount()).toBe(1);
      expect(registry.hasPersona('security-expert')).toBe(true);
    });
  });
});
