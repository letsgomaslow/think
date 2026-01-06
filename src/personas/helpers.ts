// Persona Selection Helpers
// Utility functions for persona selection and recommendation

import {
    PersonaCategoryId,
    PredefinedPersona
} from './types.js';
import { personaRegistry } from './registry.js';

/**
 * Get all personas in a specific category
 * @param categoryId - The category ID to filter by
 * @returns Array of personas in the specified category
 */
export function getPersonasByCategory(categoryId: PersonaCategoryId): PredefinedPersona[] {
    return personaRegistry.getPersonasByCategory(categoryId);
}

/**
 * Get recommended personas for a given topic (searches across all categories)
 * Uses category-specific recommendation functions and combines results with scoring
 * @param topic - The topic to find relevant personas for
 * @param limit - Maximum number of recommendations to return (default: 5)
 * @returns Array of recommended personas sorted by relevance
 */
export function getRecommendedPersonas(topic: string, limit: number = 5): PredefinedPersona[] {
    const allPersonas = personaRegistry.getAllPersonas();
    const topicLower = topic.toLowerCase();
    const recommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    for (const persona of allPersonas) {
        let score = 0;

        // Check name match (highest weight)
        if (persona.name.toLowerCase().includes(topicLower)) {
            score += 5;
        }

        // Check expertise match (high weight)
        if (persona.expertise.some(exp => exp.toLowerCase().includes(topicLower))) {
            score += 3;
        }

        // Check tag match (medium weight)
        if (persona.tags.some(tag => tag.toLowerCase().includes(topicLower))) {
            score += 2;
        }

        // Check concerns match (low weight)
        if (persona.concerns.some(concern => concern.toLowerCase().includes(topicLower))) {
            score += 1;
        }

        if (score > 0) {
            recommendations.push({ persona, score });
        }
    }

    // Remove duplicates by ID
    const uniqueRecommendations = Array.from(
        new Map(recommendations.map(r => [r.persona.id, r])).values()
    );

    // Sort by score (descending) and return top N personas
    return uniqueRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.persona);
}

/**
 * Suggest personas based on a topic or problem description
 * Provides a mix of perspectives from different categories with diversity
 * @param topic - The topic or problem to analyze
 * @param maxPersonas - Maximum number of personas to suggest (default: 5)
 * @returns Array of suggested personas with diverse perspectives
 */
export function suggestPersonasForTopic(topic: string, maxPersonas: number = 5): PredefinedPersona[] {
    const allPersonas = personaRegistry.getAllPersonas();
    const topicLower = topic.toLowerCase();
    const suggestions: Array<{ persona: PredefinedPersona; score: number; category: PersonaCategoryId }> = [];

    // Score all personas based on topic relevance
    for (const persona of allPersonas) {
        let score = 0;

        // Check name match (highest weight)
        if (persona.name.toLowerCase().includes(topicLower)) {
            score += 5;
        }

        // Check expertise match (high weight)
        for (const exp of persona.expertise) {
            if (exp.toLowerCase().includes(topicLower)) {
                score += 3;
            }
        }

        // Check tag match (medium weight)
        for (const tag of persona.tags) {
            if (tag.toLowerCase().includes(topicLower)) {
                score += 2;
            }
        }

        // Check concerns match (low weight)
        for (const concern of persona.concerns) {
            if (concern.toLowerCase().includes(topicLower)) {
                score += 1;
            }
        }

        // Check typical questions match (low weight)
        for (const question of persona.typicalQuestions) {
            if (question.toLowerCase().includes(topicLower)) {
                score += 1;
            }
        }

        if (score > 0) {
            suggestions.push({ persona, score, category: persona.category });
        }
    }

    // Sort by score (descending)
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

    const allPersonas = personaRegistry.getAllPersonas();
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
