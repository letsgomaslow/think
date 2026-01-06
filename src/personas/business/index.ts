// Business Experts Category Index
// Exports all business personas with category metadata and utilities

import { PersonaCategory, PredefinedPersona } from '../types.js';
import { personaRegistry } from '../registry.js';
import { productManager } from './product-manager.js';
import { growthHacker } from './growth-hacker.js';
import { customerSuccess } from './customer-success.js';
import { businessAnalyst } from './business-analyst.js';

/**
 * Business Experts category metadata
 */
export const businessCategory: PersonaCategory = {
    id: 'business',
    name: 'Business Experts',
    description: 'Specialized business personas covering product management, growth, customer success, and business analysis. These personas provide strategic business expertise and help evaluate decisions from market, customer, and operational perspectives.',
    keywords: [
        'business',
        'product',
        'growth',
        'strategy',
        'customer',
        'market',
        'roadmap',
        'prioritization',
        'metrics',
        'analytics',
        'acquisition',
        'retention',
        'onboarding',
        'churn',
        'requirements',
        'process',
        'ROI',
        'stakeholder'
    ],
    icon: '💼'
};

/**
 * All business expert personas
 */
export const businessPersonas: PredefinedPersona[] = [
    productManager,
    growthHacker,
    customerSuccess,
    businessAnalyst
];

/**
 * Export individual personas for direct import
 */
export {
    productManager,
    growthHacker,
    customerSuccess,
    businessAnalyst
};

/**
 * Get all business personas
 */
export function getBusinessPersonas(): PredefinedPersona[] {
    return [...businessPersonas];
}

/**
 * Get a business persona by ID
 */
export function getBusinessPersonaById(id: string): PredefinedPersona | undefined {
    return businessPersonas.find(p => p.id === id);
}

/**
 * Get business personas by expertise area
 */
export function getBusinessPersonasByExpertise(expertise: string): PredefinedPersona[] {
    const expertiseLower = expertise.toLowerCase();
    return businessPersonas.filter(p =>
        p.expertise.some(exp => exp.toLowerCase().includes(expertiseLower))
    );
}

/**
 * Get business personas by tag
 */
export function getBusinessPersonasByTag(tag: string): PredefinedPersona[] {
    const tagLower = tag.toLowerCase();
    return businessPersonas.filter(p =>
        p.tags.some(t => t.toLowerCase().includes(tagLower))
    );
}

/**
 * Get recommended business personas for a given topic
 */
export function getRecommendedBusinessPersonas(topic: string): PredefinedPersona[] {
    const topicLower = topic.toLowerCase();
    const recommendations: Array<{ persona: PredefinedPersona; score: number }> = [];

    for (const persona of businessPersonas) {
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
 * Register all business personas and category with the global registry
 * This function should be called during initialization
 */
export function registerBusinessPersonas(): void {
    personaRegistry.registerCategory(businessCategory);
    personaRegistry.registerPersonas(businessPersonas);
}

// Auto-register on module load
registerBusinessPersonas();
