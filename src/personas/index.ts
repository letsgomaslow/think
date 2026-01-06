// Persona Library Main Export
// Central entry point for the persona library system

// Export all types
export * from './types.js';

// Export registry and factory
export { PersonaRegistry, personaRegistry } from './registry.js';
export { PersonaFactory, personaFactory } from './factory.js';

// Export helpers
export * from './helpers.js';

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
import {
    getPersonasByCategory as getPersonasByCategoryHelper,
    getRecommendedPersonas as getRecommendedPersonasHelper,
    suggestPersonasForTopic as suggestPersonasForTopicHelper,
    getComplementaryPersonas as getComplementaryPersonasHelper
} from './helpers.js';

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
    return getPersonasByCategoryHelper(categoryId);
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
    return getRecommendedPersonasHelper(topic, limit);
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
    return suggestPersonasForTopicHelper(topic, maxPersonas);
}

/**
 * Get complementary personas for a given persona ID
 * Returns personas that work well together with the specified persona
 * @param personaId - The ID of the persona to find complements for
 * @param maxResults - Maximum number of complementary personas to return (default: 3)
 * @returns Array of complementary personas
 */
export function getComplementaryPersonas(personaId: string, maxResults: number = 3): PredefinedPersona[] {
    return getComplementaryPersonasHelper(personaId, maxResults);
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
