// Persona Library Main Export
// Central entry point for the persona library system

// Export all types
export * from './types.js';

// Export registry and factory
export { PersonaRegistry, personaRegistry } from './registry.js';
export { PersonaFactory, personaFactory } from './factory.js';

// Import and re-export all category modules
import {
    technicalCategory,
    technicalPersonas,
    getTechnicalPersonas,
    getTechnicalPersonaById,
    getTechnicalPersonasByExpertise,
    getTechnicalPersonasByTag,
    getRecommendedTechnicalPersonas
} from './technical/index.js';

import {
    businessCategory,
    businessPersonas,
    getBusinessPersonas,
    getBusinessPersonaById,
    getBusinessPersonasByExpertise,
    getBusinessPersonasByTag,
    getRecommendedBusinessPersonas
} from './business/index.js';

import {
    creativeCategory,
    creativePersonas,
    getCreativePersonas,
    getCreativePersonaById,
    getCreativePersonasByExpertise,
    getCreativePersonasByTag,
    getRecommendedCreativePersonas
} from './creative/index.js';

import {
    generalCategory,
    generalPersonas,
    getGeneralPersonas,
    getGeneralPersonaById,
    getGeneralPersonasByExpertise,
    getGeneralPersonasByTag,
    getRecommendedGeneralPersonas
} from './general/index.js';

import {
    PersonaCategory,
    PersonaCategoryId,
    PredefinedPersona,
    PersonaLibrary,
    PersonaQueryOptions,
    PersonaSearchResult
} from './types.js';
import { personaRegistry } from './registry.js';
import { personaFactory } from './factory.js';

// Re-export category modules
export {
    // Technical
    technicalCategory,
    technicalPersonas,
    getTechnicalPersonas,
    getTechnicalPersonaById,
    getTechnicalPersonasByExpertise,
    getTechnicalPersonasByTag,
    getRecommendedTechnicalPersonas,

    // Business
    businessCategory,
    businessPersonas,
    getBusinessPersonas,
    getBusinessPersonaById,
    getBusinessPersonasByExpertise,
    getBusinessPersonasByTag,
    getRecommendedBusinessPersonas,

    // Creative
    creativeCategory,
    creativePersonas,
    getCreativePersonas,
    getCreativePersonaById,
    getCreativePersonasByExpertise,
    getCreativePersonasByTag,
    getRecommendedCreativePersonas,

    // General
    generalCategory,
    generalPersonas,
    getGeneralPersonas,
    getGeneralPersonaById,
    getGeneralPersonasByExpertise,
    getGeneralPersonasByTag,
    getRecommendedGeneralPersonas
};

/**
 * All available persona categories
 */
export const allCategories: PersonaCategory[] = [
    technicalCategory,
    businessCategory,
    creativeCategory,
    generalCategory
];

/**
 * All predefined personas across all categories
 */
export const allPersonas: PredefinedPersona[] = [
    ...technicalPersonas,
    ...businessPersonas,
    ...creativePersonas,
    ...generalPersonas
];

/**
 * Get the complete persona library
 * @returns The full persona library with all categories and personas
 */
export function getPersonaLibrary(): PersonaLibrary {
    return {
        categories: personaRegistry.getAllCategories(),
        personas: personaRegistry.getAllPersonas(),
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get all personas from the registry
 * @returns Array of all predefined personas
 */
export function getAllPersonas(): PredefinedPersona[] {
    return personaRegistry.getAllPersonas();
}

/**
 * Get all categories from the registry
 * @returns Array of all persona categories
 */
export function getAllCategories(): PersonaCategory[] {
    return personaRegistry.getAllCategories();
}

/**
 * Get a persona by its ID (searches across all categories)
 * @param id - The persona ID to search for
 * @returns The persona if found, undefined otherwise
 */
export function getPersonaById(id: string): PredefinedPersona | undefined {
    return personaRegistry.getPersonaById(id);
}

/**
 * Get all personas in a specific category
 * @param categoryId - The category ID to filter by
 * @returns Array of personas in the specified category
 */
export function getPersonasByCategory(categoryId: PersonaCategoryId): PredefinedPersona[] {
    return personaRegistry.getPersonasByCategory(categoryId);
}

/**
 * Get a category by its ID
 * @param categoryId - The category ID to search for
 * @returns The category if found, undefined otherwise
 */
export function getCategoryById(categoryId: PersonaCategoryId): PersonaCategory | undefined {
    return personaRegistry.getCategoryById(categoryId);
}

/**
 * Search for personas by expertise area (searches across all categories)
 * @param expertise - The expertise area to search for
 * @returns Array of personas matching the expertise
 */
export function getPersonasByExpertise(expertise: string): PredefinedPersona[] {
    return personaRegistry.getPersonasByExpertise(expertise);
}

/**
 * Search for personas by tag (searches across all categories)
 * @param tag - The tag to search for
 * @returns Array of personas matching the tag
 */
export function getPersonasByTag(tag: string): PredefinedPersona[] {
    return personaRegistry.getPersonasByTag(tag);
}

/**
 * Query personas using multiple filter criteria
 * @param options - Query options for filtering personas
 * @returns Array of personas matching the query
 */
export function queryPersonas(options: PersonaQueryOptions): PredefinedPersona[] {
    return personaRegistry.query(options);
}

/**
 * Search for personas with relevance scoring
 * @param query - Search query string
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of search results with relevance scores
 */
export function searchPersonas(query: string, limit?: number): PersonaSearchResult[] {
    return personaRegistry.search(query, limit);
}

/**
 * Get recommended personas for a given topic (searches across all categories)
 * @param topic - The topic to find relevant personas for
 * @param limit - Maximum number of recommendations to return (default: 5)
 * @returns Array of recommended personas sorted by relevance
 */
export function getRecommendedPersonas(topic: string, limit: number = 5): PredefinedPersona[] {
    const allRecommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    // Get recommendations from each category
    const technicalRecs = getRecommendedTechnicalPersonas(topic);
    const businessRecs = getRecommendedBusinessPersonas(topic);
    const creativeRecs = getRecommendedCreativePersonas(topic);
    const generalRecs = getRecommendedGeneralPersonas(topic);

    // Combine all recommendations with scores
    const topicLower = topic.toLowerCase();

    for (const persona of [...technicalRecs, ...businessRecs, ...creativeRecs, ...generalRecs]) {
        let score = 0;

        // Check name match
        if (persona.name.toLowerCase().includes(topicLower)) {
            score += 5;
        }

        // Check expertise match
        if (persona.expertise.some(exp => exp.toLowerCase().includes(topicLower))) {
            score += 3;
        }

        // Check tag match
        if (persona.tags.some(tag => tag.toLowerCase().includes(topicLower))) {
            score += 2;
        }

        // Check concerns match
        if (persona.concerns.some(concern => concern.toLowerCase().includes(topicLower))) {
            score += 1;
        }

        if (score > 0) {
            allRecommendations.push({ persona, score });
        }
    }

    // Remove duplicates by ID
    const uniqueRecommendations = Array.from(
        new Map(allRecommendations.map(r => [r.persona.id, r])).values()
    );

    // Sort by score and return top N personas
    return uniqueRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.persona);
}

/**
 * Check if a persona exists by ID
 * @param id - The persona ID to check
 * @returns True if the persona exists, false otherwise
 */
export function personaExists(id: string): boolean {
    return personaRegistry.exists(id);
}

/**
 * Get the total count of all personas
 * @returns Total number of predefined personas
 */
export function getPersonaCount(): number {
    return personaRegistry.getPersonaCount();
}

/**
 * Get the count of personas in a specific category
 * @param categoryId - The category ID to count
 * @returns Number of personas in the category
 */
export function getPersonaCountByCategory(categoryId: PersonaCategoryId): number {
    return personaRegistry.getPersonaCountByCategory(categoryId);
}

/**
 * Suggest personas based on a topic or problem description
 * Provides a mix of perspectives from different categories
 * @param topic - The topic or problem to analyze
 * @param maxPersonas - Maximum number of personas to suggest (default: 5)
 * @returns Array of suggested personas with diverse perspectives
 */
export function suggestPersonasForTopic(topic: string, maxPersonas: number = 5): PredefinedPersona[] {
    const topicLower = topic.toLowerCase();
    const suggestions: Array<{ persona: PredefinedPersona; score: number; category: PersonaCategoryId }> = [];

    // Score all personas
    for (const persona of allPersonas) {
        let score = 0;

        // Check name match
        if (persona.name.toLowerCase().includes(topicLower)) {
            score += 5;
        }

        // Check expertise match
        for (const exp of persona.expertise) {
            if (exp.toLowerCase().includes(topicLower)) {
                score += 3;
            }
        }

        // Check tag match
        for (const tag of persona.tags) {
            if (tag.toLowerCase().includes(topicLower)) {
                score += 2;
            }
        }

        // Check concerns match
        for (const concern of persona.concerns) {
            if (concern.toLowerCase().includes(topicLower)) {
                score += 1;
            }
        }

        // Check typical questions match
        for (const question of persona.typicalQuestions) {
            if (question.toLowerCase().includes(topicLower)) {
                score += 1;
            }
        }

        if (score > 0) {
            suggestions.push({ persona, score, category: persona.category });
        }
    }

    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);

    // Select personas ensuring diversity across categories
    const selected: PredefinedPersona[] = [];
    const categoryCounts = new Map<PersonaCategoryId, number>();

    for (const suggestion of suggestions) {
        if (selected.length >= maxPersonas) {
            break;
        }

        const categoryCount = categoryCounts.get(suggestion.category) || 0;

        // Prefer diversity: limit to 2 personas per category unless we need more
        if (categoryCount < 2 || selected.length >= maxPersonas - 1) {
            selected.push(suggestion.persona);
            categoryCounts.set(suggestion.category, categoryCount + 1);
        }
    }

    // If we didn't get enough diverse personas, add more from the top-scored ones
    if (selected.length < maxPersonas) {
        for (const suggestion of suggestions) {
            if (selected.length >= maxPersonas) {
                break;
            }
            if (!selected.find(p => p.id === suggestion.persona.id)) {
                selected.push(suggestion.persona);
            }
        }
    }

    return selected;
}

/**
 * Get complementary personas for a given persona ID
 * Returns personas that work well together with the specified persona
 * @param personaId - The ID of the persona to find complements for
 * @param maxResults - Maximum number of complementary personas to return (default: 3)
 * @returns Array of complementary personas
 */
export function getComplementaryPersonas(personaId: string, maxResults: number = 3): PredefinedPersona[] {
    const persona = personaRegistry.getPersonaById(personaId);
    if (!persona) {
        return [];
    }

    const complementary: PredefinedPersona[] = [];

    // First, add explicitly listed complementary personas
    if (persona.complementaryPersonas) {
        for (const compId of persona.complementaryPersonas) {
            const compPersona = personaRegistry.getPersonaById(compId);
            if (compPersona) {
                complementary.push(compPersona);
            }
        }
    }

    // If we need more, find personas from different categories with overlapping concerns
    if (complementary.length < maxResults) {
        const otherPersonas = allPersonas.filter(
            p => p.id !== personaId &&
            p.category !== persona.category &&
            !complementary.find(comp => comp.id === p.id)
        );

        const scored = otherPersonas.map(p => ({
            persona: p,
            score: p.concerns.filter(c => persona.concerns.includes(c)).length
        }));

        scored.sort((a, b) => b.score - a.score);

        for (const item of scored) {
            if (complementary.length >= maxResults) {
                break;
            }
            complementary.push(item.persona);
        }
    }

    return complementary.slice(0, maxResults);
}

/**
 * Export a summary of the persona library
 * Useful for documentation and overview purposes
 * @returns Object with library statistics
 */
export function getLibrarySummary() {
    return {
        totalPersonas: getPersonaCount(),
        totalCategories: allCategories.length,
        categories: allCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            personaCount: getPersonaCountByCategory(cat.id),
            icon: cat.icon
        })),
        version: '1.0.0'
    };
}
