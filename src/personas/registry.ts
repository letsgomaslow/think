// Persona Registry for think-mcp Server
// Stores and retrieves predefined personas

import {
    PredefinedPersona,
    PersonaCategory,
    PersonaCategoryId,
    PersonaQueryOptions,
    PersonaSearchResult,
    PersonaLibrary
} from './types.js';

/**
 * Central registry for managing predefined personas
 * Provides storage, retrieval, and query capabilities for personas
 */
export class PersonaRegistry {
    private personas: Map<string, PredefinedPersona>;
    private categories: Map<PersonaCategoryId, PersonaCategory>;
    private personasByCategory: Map<PersonaCategoryId, PredefinedPersona[]>;
    private version: string;
    private lastUpdated: string;

    constructor() {
        this.personas = new Map();
        this.categories = new Map();
        this.personasByCategory = new Map();
        this.version = '1.0.0';
        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Register a category in the registry
     */
    public registerCategory(category: PersonaCategory): void {
        this.categories.set(category.id, category);
        if (!this.personasByCategory.has(category.id)) {
            this.personasByCategory.set(category.id, []);
        }
    }

    /**
     * Register a predefined persona in the registry
     */
    public registerPersona(persona: PredefinedPersona): void {
        if (!persona.id) {
            throw new Error('Persona must have an id');
        }
        if (!persona.category) {
            throw new Error('Persona must have a category');
        }

        this.personas.set(persona.id, persona);

        // Add to category index
        if (!this.personasByCategory.has(persona.category)) {
            this.personasByCategory.set(persona.category, []);
        }
        const categoryPersonas = this.personasByCategory.get(persona.category)!;
        if (!categoryPersonas.find(p => p.id === persona.id)) {
            categoryPersonas.push(persona);
        }

        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Register multiple personas at once
     */
    public registerPersonas(personas: PredefinedPersona[]): void {
        for (const persona of personas) {
            this.registerPersona(persona);
        }
    }

    /**
     * Get a persona by its ID
     */
    public getPersonaById(id: string): PredefinedPersona | undefined {
        return this.personas.get(id);
    }

    /**
     * Get all personas in a specific category
     */
    public getPersonasByCategory(categoryId: PersonaCategoryId): PredefinedPersona[] {
        return this.personasByCategory.get(categoryId) || [];
    }

    /**
     * Get all registered personas
     */
    public getAllPersonas(): PredefinedPersona[] {
        return Array.from(this.personas.values());
    }

    /**
     * Get all registered categories
     */
    public getAllCategories(): PersonaCategory[] {
        return Array.from(this.categories.values());
    }

    /**
     * Get a category by its ID
     */
    public getCategoryById(categoryId: PersonaCategoryId): PersonaCategory | undefined {
        return this.categories.get(categoryId);
    }

    /**
     * Query personas based on various filters
     */
    public queryPersonas(options: PersonaQueryOptions): PredefinedPersona[] {
        let results = this.getAllPersonas();

        // Filter by category
        if (options.category) {
            results = results.filter(p => p.category === options.category);
        }

        // Filter by expertise
        if (options.expertise && options.expertise.length > 0) {
            results = results.filter(p =>
                options.expertise!.some(exp =>
                    p.expertise.some(pExp =>
                        pExp.toLowerCase().includes(exp.toLowerCase())
                    )
                )
            );
        }

        // Filter by tags
        if (options.tags && options.tags.length > 0) {
            results = results.filter(p =>
                options.tags!.some(tag =>
                    p.tags.some(pTag =>
                        pTag.toLowerCase().includes(tag.toLowerCase())
                    )
                )
            );
        }

        // Filter by keywords (search in name, background, perspective)
        if (options.keywords && options.keywords.length > 0) {
            results = results.filter(p => {
                const searchText = `${p.name} ${p.background} ${p.perspective}`.toLowerCase();
                return options.keywords!.some(keyword =>
                    searchText.includes(keyword.toLowerCase())
                );
            });
        }

        // Apply limit
        if (options.limit && options.limit > 0) {
            results = results.slice(0, options.limit);
        }

        return results;
    }

    /**
     * Search personas and return results with relevance scores
     */
    public searchPersonas(options: PersonaQueryOptions): PersonaSearchResult[] {
        const personas = this.queryPersonas(options);

        return personas.map(persona => {
            let relevance = 0;
            const matchReasons: string[] = [];

            // Calculate relevance score based on matches
            if (options.category && persona.category === options.category) {
                relevance += 0.3;
                matchReasons.push(`in ${options.category} category`);
            }

            if (options.expertise && options.expertise.length > 0) {
                const matchingExpertise = options.expertise.filter(exp =>
                    persona.expertise.some(pExp =>
                        pExp.toLowerCase().includes(exp.toLowerCase())
                    )
                );
                if (matchingExpertise.length > 0) {
                    relevance += 0.3 * (matchingExpertise.length / options.expertise.length);
                    matchReasons.push(`expertise in ${matchingExpertise.join(', ')}`);
                }
            }

            if (options.tags && options.tags.length > 0) {
                const matchingTags = options.tags.filter(tag =>
                    persona.tags.some(pTag =>
                        pTag.toLowerCase().includes(tag.toLowerCase())
                    )
                );
                if (matchingTags.length > 0) {
                    relevance += 0.2 * (matchingTags.length / options.tags.length);
                    matchReasons.push(`tagged as ${matchingTags.join(', ')}`);
                }
            }

            if (options.keywords && options.keywords.length > 0) {
                const searchText = `${persona.name} ${persona.background} ${persona.perspective}`.toLowerCase();
                const matchingKeywords = options.keywords.filter(keyword =>
                    searchText.includes(keyword.toLowerCase())
                );
                if (matchingKeywords.length > 0) {
                    relevance += 0.2 * (matchingKeywords.length / options.keywords.length);
                    matchReasons.push(`matches keywords: ${matchingKeywords.join(', ')}`);
                }
            }

            // Default relevance if no specific matches
            if (relevance === 0) {
                relevance = 0.1;
                matchReasons.push('general match');
            }

            return {
                persona,
                relevance: Math.min(relevance, 1.0),
                matchReason: matchReasons.join('; ')
            };
        }).sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Get personas by expertise areas
     */
    public getPersonasByExpertise(expertise: string[]): PredefinedPersona[] {
        return this.queryPersonas({ expertise });
    }

    /**
     * Get personas by tags
     */
    public getPersonasByTags(tags: string[]): PredefinedPersona[] {
        return this.queryPersonas({ tags });
    }

    /**
     * Search personas by keywords
     */
    public searchByKeywords(keywords: string[]): PredefinedPersona[] {
        return this.queryPersonas({ keywords });
    }

    /**
     * Get the persona library representation
     */
    public getLibrary(): PersonaLibrary {
        return {
            categories: this.getAllCategories(),
            personas: this.getAllPersonas(),
            version: this.version,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Get count of registered personas
     */
    public getPersonaCount(): number {
        return this.personas.size;
    }

    /**
     * Get count of registered categories
     */
    public getCategoryCount(): number {
        return this.categories.size;
    }

    /**
     * Check if a persona exists by ID
     */
    public hasPersona(id: string): boolean {
        return this.personas.has(id);
    }

    /**
     * Check if a category exists by ID
     */
    public hasCategory(categoryId: PersonaCategoryId): boolean {
        return this.categories.has(categoryId);
    }

    /**
     * Clear all registered personas and categories
     */
    public clear(): void {
        this.personas.clear();
        this.categories.clear();
        this.personasByCategory.clear();
        this.lastUpdated = new Date().toISOString();
    }
}

/**
 * Global singleton instance of the persona registry
 */
export const personaRegistry = new PersonaRegistry();
