// Technical Experts Category Index
// Exports all technical personas with category metadata and utilities

import { PersonaCategory, PredefinedPersona } from '../types.js';
import { personaRegistry } from '../registry.js';
import { securitySpecialist } from './security-specialist.js';
import { performanceEngineer } from './performance-engineer.js';
import { uxResearcher } from './ux-researcher.js';
import { devopsExpert } from './devops-expert.js';

/**
 * Technical Experts category metadata
 */
export const technicalCategory: PersonaCategory = {
    id: 'technical',
    name: 'Technical Experts',
    description: 'Specialized technical personas covering security, performance, user experience, and DevOps. These personas provide deep technical expertise and help evaluate decisions from specialized engineering perspectives.',
    keywords: [
        'engineering',
        'technical',
        'architecture',
        'security',
        'performance',
        'ux',
        'devops',
        'infrastructure',
        'optimization',
        'scalability',
        'accessibility',
        'reliability'
    ],
    icon: '⚙️'
};

/**
 * All technical expert personas
 */
export const technicalPersonas: PredefinedPersona[] = [
    securitySpecialist,
    performanceEngineer,
    uxResearcher,
    devopsExpert
];

/**
 * Export individual personas for direct import
 */
export {
    securitySpecialist,
    performanceEngineer,
    uxResearcher,
    devopsExpert
};

/**
 * Get all technical personas
 */
export function getTechnicalPersonas(): PredefinedPersona[] {
    return [...technicalPersonas];
}

/**
 * Get a technical persona by ID
 */
export function getTechnicalPersonaById(id: string): PredefinedPersona | undefined {
    return technicalPersonas.find(p => p.id === id);
}

/**
 * Get technical personas by expertise area
 */
export function getTechnicalPersonasByExpertise(expertise: string): PredefinedPersona[] {
    const expertiseLower = expertise.toLowerCase();
    return technicalPersonas.filter(p =>
        p.expertise.some(exp => exp.toLowerCase().includes(expertiseLower))
    );
}

/**
 * Get technical personas by tag
 */
export function getTechnicalPersonasByTag(tag: string): PredefinedPersona[] {
    const tagLower = tag.toLowerCase();
    return technicalPersonas.filter(p =>
        p.tags.some(t => t.toLowerCase().includes(tagLower))
    );
}

/**
 * Get recommended technical personas for a given topic
 */
export function getRecommendedTechnicalPersonas(topic: string): PredefinedPersona[] {
    const topicLower = topic.toLowerCase();
    const recommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    for (const persona of technicalPersonas) {
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
 * Register all technical personas and category with the global registry
 * This function should be called during initialization
 */
export function registerTechnicalPersonas(): void {
    personaRegistry.registerCategory(technicalCategory);
    personaRegistry.registerPersonas(technicalPersonas);
}

// Auto-register on module load
registerTechnicalPersonas();
