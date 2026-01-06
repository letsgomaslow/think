// Persona Factory for think-mcp Server
// Creates persona instances from predefined templates or custom definitions

import { PersonaData } from '../models/interfaces.js';
import {
    PredefinedPersona,
    EnhancedPersonaData,
    PersonaCreationOptions,
    PersonaCategoryId
} from './types.js';
import { personaRegistry } from './registry.js';

/**
 * Factory for creating persona instances
 * Supports creation from predefined templates with optional overrides
 * and creation of fully custom personas
 */
export class PersonaFactory {
    /**
     * Create a persona from a predefined template
     * @param predefinedId - The ID of the predefined persona to use as a template
     * @param overrides - Optional overrides to customize the persona
     * @param mergeStrategy - Whether to merge overrides with template or replace (default: 'merge')
     * @returns The created persona data
     * @throws Error if predefined persona not found
     */
    public createFromPredefined(
        predefinedId: string,
        overrides?: Partial<EnhancedPersonaData>,
        mergeStrategy: 'merge' | 'replace' = 'merge'
    ): EnhancedPersonaData {
        const template = personaRegistry.getPersonaById(predefinedId);

        if (!template) {
            throw new Error(`Predefined persona with ID '${predefinedId}' not found`);
        }

        // Start with the template
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

        // Apply overrides if provided
        if (overrides) {
            if (mergeStrategy === 'merge') {
                return this.mergePersonaData(persona, overrides);
            } else {
                // Replace strategy - overrides completely replace values
                return {
                    ...persona,
                    ...overrides,
                    // Ensure required fields are present
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
    }

    /**
     * Create a persona using creation options
     * @param options - Options specifying predefined template and/or overrides
     * @returns The created persona data
     */
    public createFromOptions(options: PersonaCreationOptions): EnhancedPersonaData {
        if (!options.predefinedId) {
            throw new Error('predefinedId is required in PersonaCreationOptions');
        }

        return this.createFromPredefined(
            options.predefinedId,
            options.overrides,
            options.mergeStrategy || 'merge'
        );
    }

    /**
     * Create a fully custom persona from scratch
     * @param personaData - Complete persona data
     * @returns The created persona data
     */
    public createCustom(personaData: EnhancedPersonaData): EnhancedPersonaData {
        // Validate required fields
        this.validatePersonaData(personaData);

        // Return a copy to avoid mutations
        return {
            id: personaData.id,
            name: personaData.name,
            expertise: [...personaData.expertise],
            background: personaData.background,
            perspective: personaData.perspective,
            biases: [...personaData.biases],
            communication: { ...personaData.communication },
            category: personaData.category,
            tags: [...personaData.tags],
            concerns: [...personaData.concerns],
            typicalQuestions: [...personaData.typicalQuestions]
        };
    }

    /**
     * Convert EnhancedPersonaData to base PersonaData format
     * Useful for backward compatibility with existing council tool
     * @param enhancedPersona - Enhanced persona data with category and metadata
     * @returns Base PersonaData without enhanced fields
     */
    public toBasePersonaData(enhancedPersona: EnhancedPersonaData): PersonaData {
        return {
            id: enhancedPersona.id,
            name: enhancedPersona.name,
            expertise: [...enhancedPersona.expertise],
            background: enhancedPersona.background,
            perspective: enhancedPersona.perspective,
            biases: [...enhancedPersona.biases],
            communication: { ...enhancedPersona.communication }
        };
    }

    /**
     * Create multiple personas from a list of predefined IDs
     * @param predefinedIds - Array of predefined persona IDs
     * @returns Array of created personas
     */
    public createMultipleFromPredefined(predefinedIds: string[]): EnhancedPersonaData[] {
        return predefinedIds.map(id => this.createFromPredefined(id));
    }

    /**
     * Create personas from a category
     * @param category - The category to create personas from
     * @param limit - Optional limit on number of personas to create
     * @returns Array of created personas from the category
     */
    public createFromCategory(
        category: PersonaCategoryId,
        limit?: number
    ): EnhancedPersonaData[] {
        const categoryPersonas = personaRegistry.getPersonasByCategory(category);

        if (categoryPersonas.length === 0) {
            throw new Error(`No personas found in category '${category}'`);
        }

        const personasToCreate = limit
            ? categoryPersonas.slice(0, limit)
            : categoryPersonas;

        return personasToCreate.map(template =>
            this.createFromPredefined(template.id)
        );
    }

    /**
     * Clone an existing persona with a new ID
     * @param sourcePersona - The persona to clone
     * @param newId - New ID for the cloned persona
     * @param overrides - Optional overrides to apply to the clone
     * @returns The cloned persona with new ID
     */
    public clonePersona(
        sourcePersona: EnhancedPersonaData,
        newId: string,
        overrides?: Partial<EnhancedPersonaData>
    ): EnhancedPersonaData {
        const cloned: EnhancedPersonaData = {
            ...sourcePersona,
            id: newId,
            expertise: [...sourcePersona.expertise],
            biases: [...sourcePersona.biases],
            communication: { ...sourcePersona.communication },
            tags: [...sourcePersona.tags],
            concerns: [...sourcePersona.concerns],
            typicalQuestions: [...sourcePersona.typicalQuestions]
        };

        if (overrides) {
            return this.mergePersonaData(cloned, overrides);
        }

        return cloned;
    }

    /**
     * Merge persona data with overrides
     * Arrays are concatenated and deduplicated, objects are merged
     * @param base - Base persona data
     * @param overrides - Partial overrides to merge
     * @returns Merged persona data
     */
    private mergePersonaData(
        base: EnhancedPersonaData,
        overrides: Partial<EnhancedPersonaData>
    ): EnhancedPersonaData {
        const merged: EnhancedPersonaData = { ...base };

        // Merge scalar values
        if (overrides.id !== undefined) merged.id = overrides.id;
        if (overrides.name !== undefined) merged.name = overrides.name;
        if (overrides.background !== undefined) merged.background = overrides.background;
        if (overrides.perspective !== undefined) merged.perspective = overrides.perspective;
        if (overrides.category !== undefined) merged.category = overrides.category;

        // Merge arrays (concatenate and deduplicate)
        if (overrides.expertise !== undefined) {
            merged.expertise = this.mergeArrays(base.expertise, overrides.expertise);
        }
        if (overrides.biases !== undefined) {
            merged.biases = this.mergeArrays(base.biases, overrides.biases);
        }
        if (overrides.tags !== undefined) {
            merged.tags = this.mergeArrays(base.tags, overrides.tags);
        }
        if (overrides.concerns !== undefined) {
            merged.concerns = this.mergeArrays(base.concerns, overrides.concerns);
        }
        if (overrides.typicalQuestions !== undefined) {
            merged.typicalQuestions = this.mergeArrays(
                base.typicalQuestions,
                overrides.typicalQuestions
            );
        }

        // Merge communication object
        if (overrides.communication !== undefined) {
            merged.communication = {
                ...base.communication,
                ...overrides.communication
            };
        }

        return merged;
    }

    /**
     * Merge two arrays and remove duplicates
     * @param base - Base array
     * @param additions - Additional items to merge
     * @returns Merged and deduplicated array
     */
    private mergeArrays(base: string[], additions: string[]): string[] {
        return Array.from(new Set([...base, ...additions]));
    }

    /**
     * Validate that persona data has all required fields
     * @param personaData - The persona data to validate
     * @throws Error if validation fails
     */
    private validatePersonaData(personaData: EnhancedPersonaData): void {
        const requiredFields = [
            'id',
            'name',
            'expertise',
            'background',
            'perspective',
            'biases',
            'communication',
            'category',
            'tags',
            'concerns',
            'typicalQuestions'
        ];

        for (const field of requiredFields) {
            if (!(field in personaData) || personaData[field as keyof EnhancedPersonaData] === undefined) {
                throw new Error(`Required field '${field}' is missing from persona data`);
            }
        }

        // Validate communication object
        if (!personaData.communication.style || !personaData.communication.tone) {
            throw new Error('communication.style and communication.tone are required');
        }

        // Validate arrays are not empty
        if (personaData.expertise.length === 0) {
            throw new Error('expertise array cannot be empty');
        }
    }

    /**
     * Get a list of all available predefined persona IDs
     * @returns Array of predefined persona IDs
     */
    public getAvailablePersonaIds(): string[] {
        return personaRegistry.getAllPersonas().map(p => p.id);
    }

    /**
     * Get a list of available persona IDs for a specific category
     * @param category - The category to get persona IDs from
     * @returns Array of persona IDs in the category
     */
    public getPersonaIdsByCategory(category: PersonaCategoryId): string[] {
        return personaRegistry.getPersonasByCategory(category).map(p => p.id);
    }

    /**
     * Check if a predefined persona exists
     * @param predefinedId - The ID to check
     * @returns True if the persona exists
     */
    public hasPersona(predefinedId: string): boolean {
        return personaRegistry.hasPersona(predefinedId);
    }
}

/**
 * Global singleton instance of the persona factory
 */
export const personaFactory = new PersonaFactory();
