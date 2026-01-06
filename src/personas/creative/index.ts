// Creative Experts Category Index
// Exports all creative personas with category metadata and utilities

import { PersonaCategory, PredefinedPersona } from '../types.js';
import { personaRegistry } from '../registry.js';
import { designThinker } from './design-thinker.js';
import { storyteller } from './storyteller.js';
import { brandStrategist } from './brand-strategist.js';
import { innovationCatalyst } from './innovation-catalyst.js';

/**
 * Creative Experts category metadata
 */
export const creativeCategory: PersonaCategory = {
    id: 'creative',
    name: 'Creative Experts',
    description: 'Specialized creative personas covering design thinking, storytelling, brand strategy, and innovation. These personas provide creative expertise and help evaluate decisions from human-centered design, narrative, branding, and innovation perspectives.',
    keywords: [
        'creative',
        'design',
        'innovation',
        'storytelling',
        'narrative',
        'branding',
        'brand-strategy',
        'design-thinking',
        'human-centered-design',
        'ideation',
        'prototyping',
        'empathy',
        'communication',
        'messaging',
        'positioning',
        'differentiation',
        'disruption',
        'blue-ocean',
        'breakthrough',
        'transformation',
        'experience-design',
        'emotional-connection'
    ],
    icon: '🎨'
};

/**
 * All creative expert personas
 */
export const creativePersonas: PredefinedPersona[] = [
    designThinker,
    storyteller,
    brandStrategist,
    innovationCatalyst
];

/**
 * Export individual personas for direct import
 */
export {
    designThinker,
    storyteller,
    brandStrategist,
    innovationCatalyst
};

/**
 * Get all creative personas
 */
export function getCreativePersonas(): PredefinedPersona[] {
    return [...creativePersonas];
}

/**
 * Get a creative persona by ID
 */
export function getCreativePersonaById(id: string): PredefinedPersona | undefined {
    return creativePersonas.find(p => p.id === id);
}

/**
 * Get creative personas by expertise area
 */
export function getCreativePersonasByExpertise(expertise: string): PredefinedPersona[] {
    const expertiseLower = expertise.toLowerCase();
    return creativePersonas.filter(p =>
        p.expertise.some(exp => exp.toLowerCase().includes(expertiseLower))
    );
}

/**
 * Get creative personas by tag
 */
export function getCreativePersonasByTag(tag: string): PredefinedPersona[] {
    const tagLower = tag.toLowerCase();
    return creativePersonas.filter(p =>
        p.tags.some(t => t.toLowerCase().includes(tagLower))
    );
}

/**
 * Get recommended creative personas for a given topic
 */
export function getRecommendedCreativePersonas(topic: string): PredefinedPersona[] {
    const topicLower = topic.toLowerCase();
    const recommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    for (const persona of creativePersonas) {
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
 * Register all creative personas and category with the global registry
 * This function should be called during initialization
 */
export function registerCreativePersonas(): void {
    personaRegistry.registerCategory(creativeCategory);
    personaRegistry.registerPersonas(creativePersonas);
}

// Auto-register on module load
registerCreativePersonas();
