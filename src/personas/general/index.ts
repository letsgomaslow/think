// General Experts Category Index
// Exports all general personas with category metadata and utilities

import { PersonaCategory, PredefinedPersona } from '../types.js';
import { personaRegistry } from '../registry.js';
import { devilsAdvocate } from './devils-advocate.js';
import { systemsThinker } from './systems-thinker.js';

/**
 * General Experts category metadata
 */
export const generalCategory: PersonaCategory = {
    id: 'general',
    name: 'General Experts',
    description: 'General-purpose personas for critical thinking and holistic analysis. These personas provide foundational analytical expertise and help evaluate decisions from critical thinking, systems thinking, and holistic perspectives.',
    keywords: [
        'critical-thinking',
        'systems-thinking',
        'analysis',
        'holistic',
        'risk',
        'assumptions',
        'feedback-loops',
        'interconnections',
        'unintended-consequences',
        'complexity',
        'skepticism',
        'questioning',
        'stress-testing',
        'second-order-effects',
        'leverage-points',
        'mental-models',
        'structured-critique',
        'systemic-change'
    ],
    icon: '🔍'
};

/**
 * All general expert personas
 */
export const generalPersonas: PredefinedPersona[] = [
    devilsAdvocate,
    systemsThinker
];

/**
 * Export individual personas for direct import
 */
export {
    devilsAdvocate,
    systemsThinker
};

/**
 * Get all general personas
 */
export function getGeneralPersonas(): PredefinedPersona[] {
    return [...generalPersonas];
}

/**
 * Get a general persona by ID
 */
export function getGeneralPersonaById(id: string): PredefinedPersona | undefined {
    return generalPersonas.find(p => p.id === id);
}

/**
 * Get general personas by expertise area
 */
export function getGeneralPersonasByExpertise(expertise: string): PredefinedPersona[] {
    const expertiseLower = expertise.toLowerCase();
    return generalPersonas.filter(p =>
        p.expertise.some(exp => exp.toLowerCase().includes(expertiseLower))
    );
}

/**
 * Get general personas by tag
 */
export function getGeneralPersonasByTag(tag: string): PredefinedPersona[] {
    const tagLower = tag.toLowerCase();
    return generalPersonas.filter(p =>
        p.tags.some(t => t.toLowerCase().includes(tagLower))
    );
}

/**
 * Get recommended general personas for a given topic
 */
export function getRecommendedGeneralPersonas(topic: string): PredefinedPersona[] {
    const topicLower = topic.toLowerCase();
    const recommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    for (const persona of generalPersonas) {
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
            recommendations.push({ persona, score });
        }
    }

    // Sort by score and return personas
    return recommendations
        .sort((a, b) => b.score - a.score)
        .map(r => r.persona);
}

/**
 * Register all general personas and category with the global registry
 * This function should be called during initialization
 */
export function registerGeneralPersonas(): void {
    personaRegistry.registerCategory(generalCategory);
    personaRegistry.registerPersonas(generalPersonas);
}

// Auto-register on module load
registerGeneralPersonas();
