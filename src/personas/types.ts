// Persona Library Types for think-mcp Server

import { PersonaData } from '../models/interfaces.js';

/**
 * Categories for organizing personas by domain expertise
 */
export type PersonaCategoryId = 'technical' | 'business' | 'creative' | 'general';

/**
 * Metadata for a persona category
 */
export interface PersonaCategory {
    id: PersonaCategoryId;
    name: string;
    description: string;
    keywords: string[];
    icon?: string;
}

/**
 * Enhanced PersonaData with category support and additional metadata
 */
export interface EnhancedPersonaData extends PersonaData {
    /**
     * Category this persona belongs to
     */
    category: PersonaCategoryId;

    /**
     * Tags for discovery and search
     */
    tags: string[];

    /**
     * Typical concerns this persona raises
     */
    concerns: string[];

    /**
     * Example questions this persona typically asks
     */
    typicalQuestions: string[];
}

/**
 * Predefined persona template with full metadata
 */
export interface PredefinedPersona extends EnhancedPersonaData {
    /**
     * Unique identifier for the predefined persona
     */
    id: string;

    /**
     * Display name
     */
    name: string;

    /**
     * Areas of expertise
     */
    expertise: string[];

    /**
     * Professional background
     */
    background: string;

    /**
     * Unique perspective or worldview
     */
    perspective: string;

    /**
     * Known biases or blindspots
     */
    biases: string[];

    /**
     * Communication style and tone
     */
    communication: {
        style: string;
        tone: string;
    };

    /**
     * Category classification
     */
    category: PersonaCategoryId;

    /**
     * Searchable tags
     */
    tags: string[];

    /**
     * Primary concerns
     */
    concerns: string[];

    /**
     * Example questions
     */
    typicalQuestions: string[];

    /**
     * Use case scenarios where this persona excels
     */
    useCases?: string[];

    /**
     * Other personas that complement this one
     */
    complementaryPersonas?: string[];
}

/**
 * Library containing all predefined personas organized by category
 */
export interface PersonaLibrary {
    /**
     * All available categories
     */
    categories: PersonaCategory[];

    /**
     * All predefined personas
     */
    personas: PredefinedPersona[];

    /**
     * Version of the persona library
     */
    version: string;

    /**
     * Last updated timestamp
     */
    lastUpdated: string;
}

/**
 * Options for creating a persona from a predefined template
 */
export interface PersonaCreationOptions {
    /**
     * ID of predefined persona to use as template
     */
    predefinedId?: string;

    /**
     * Custom overrides for persona properties
     */
    overrides?: Partial<EnhancedPersonaData>;

    /**
     * Whether to merge overrides with template or replace
     */
    mergeStrategy?: 'merge' | 'replace';
}

/**
 * Query options for finding personas
 */
export interface PersonaQueryOptions {
    /**
     * Filter by category
     */
    category?: PersonaCategoryId;

    /**
     * Filter by expertise areas
     */
    expertise?: string[];

    /**
     * Filter by tags
     */
    tags?: string[];

    /**
     * Search by keywords in name, background, or perspective
     */
    keywords?: string[];

    /**
     * Maximum number of results to return
     */
    limit?: number;
}

/**
 * Result from persona search/query
 */
export interface PersonaSearchResult {
    /**
     * The matching persona
     */
    persona: PredefinedPersona;

    /**
     * Relevance score (0-1)
     */
    relevance: number;

    /**
     * Explanation of why this persona matched
     */
    matchReason: string;
}
