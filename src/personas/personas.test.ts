import { describe, it, expect } from 'vitest';
import { PredefinedPersona, PersonaCategoryId } from './types.js';
import { getAllPersonas, getAllCategories } from './index.js';
import {
    technicalPersonas,
    securitySpecialist,
    performanceEngineer,
    uxResearcher,
    devopsExpert
} from './technical/index.js';
import {
    businessPersonas,
    productManager,
    growthHacker,
    customerSuccess,
    businessAnalyst
} from './business/index.js';
import {
    creativePersonas,
    designThinker,
    storyteller,
    brandStrategist,
    innovationCatalyst
} from './creative/index.js';
import {
    generalPersonas,
    devilsAdvocate,
    systemsThinker
} from './general/index.js';

describe('Predefined Personas', () => {
    const allPersonas = getAllPersonas();

    describe('Persona Library Completeness', () => {
        it('should have at least 14 predefined personas', () => {
            expect(allPersonas.length).toBeGreaterThanOrEqual(14);
        });

        it('should have exactly 4 categories', () => {
            const categories = getAllCategories();
            expect(categories).toHaveLength(4);
            expect(categories.map(c => c.id)).toEqual(
                expect.arrayContaining(['technical', 'business', 'creative', 'general'])
            );
        });

        it('should have technical personas', () => {
            expect(technicalPersonas).toHaveLength(4);
            expect(technicalPersonas).toEqual(
                expect.arrayContaining([
                    securitySpecialist,
                    performanceEngineer,
                    uxResearcher,
                    devopsExpert
                ])
            );
        });

        it('should have business personas', () => {
            expect(businessPersonas).toHaveLength(4);
            expect(businessPersonas).toEqual(
                expect.arrayContaining([
                    productManager,
                    growthHacker,
                    customerSuccess,
                    businessAnalyst
                ])
            );
        });

        it('should have creative personas', () => {
            expect(creativePersonas).toHaveLength(4);
            expect(creativePersonas).toEqual(
                expect.arrayContaining([
                    designThinker,
                    storyteller,
                    brandStrategist,
                    innovationCatalyst
                ])
            );
        });

        it('should have general personas', () => {
            expect(generalPersonas).toHaveLength(2);
            expect(generalPersonas).toEqual(
                expect.arrayContaining([
                    devilsAdvocate,
                    systemsThinker
                ])
            );
        });
    });

    describe('Persona Structure Validation', () => {
        it('should have all required fields for each persona', () => {
            for (const persona of allPersonas) {
                // Required string fields
                expect(persona.id).toBeTruthy();
                expect(typeof persona.id).toBe('string');
                expect(persona.id.length).toBeGreaterThan(0);

                expect(persona.name).toBeTruthy();
                expect(typeof persona.name).toBe('string');
                expect(persona.name.length).toBeGreaterThan(0);

                expect(persona.background).toBeTruthy();
                expect(typeof persona.background).toBe('string');
                expect(persona.background.length).toBeGreaterThan(10); // Meaningful background

                expect(persona.perspective).toBeTruthy();
                expect(typeof persona.perspective).toBe('string');
                expect(persona.perspective.length).toBeGreaterThan(10); // Meaningful perspective

                // Required array fields
                expect(Array.isArray(persona.expertise)).toBe(true);
                expect(persona.expertise.length).toBeGreaterThan(0);

                expect(Array.isArray(persona.biases)).toBe(true);
                expect(persona.biases.length).toBeGreaterThan(0);

                expect(Array.isArray(persona.tags)).toBe(true);
                expect(persona.tags.length).toBeGreaterThan(0);

                expect(Array.isArray(persona.concerns)).toBe(true);
                expect(persona.concerns.length).toBeGreaterThan(0);

                expect(Array.isArray(persona.typicalQuestions)).toBe(true);
                expect(persona.typicalQuestions.length).toBeGreaterThan(0);

                // Required communication object
                expect(persona.communication).toBeTruthy();
                expect(typeof persona.communication).toBe('object');
                expect(persona.communication.style).toBeTruthy();
                expect(typeof persona.communication.style).toBe('string');
                expect(persona.communication.style.length).toBeGreaterThan(0);
                expect(persona.communication.tone).toBeTruthy();
                expect(typeof persona.communication.tone).toBe('string');
                expect(persona.communication.tone.length).toBeGreaterThan(0);

                // Valid category
                expect(persona.category).toBeTruthy();
                expect(['technical', 'business', 'creative', 'general']).toContain(persona.category);
            }
        });

        it('should have unique IDs across all personas', () => {
            const ids = allPersonas.map(p => p.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have unique names across all personas', () => {
            const names = allPersonas.map(p => p.name);
            const uniqueNames = new Set(names);
            expect(uniqueNames.size).toBe(names.length);
        });

        it('should have IDs in kebab-case format', () => {
            for (const persona of allPersonas) {
                expect(persona.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
            }
        });

        it('should have meaningful expertise arrays with multiple items', () => {
            for (const persona of allPersonas) {
                expect(persona.expertise.length).toBeGreaterThanOrEqual(3);
                for (const expertise of persona.expertise) {
                    expect(typeof expertise).toBe('string');
                    expect(expertise.length).toBeGreaterThan(5); // Meaningful expertise
                }
            }
        });

        it('should have meaningful concerns with specific issues', () => {
            for (const persona of allPersonas) {
                expect(persona.concerns.length).toBeGreaterThanOrEqual(3);
                for (const concern of persona.concerns) {
                    expect(typeof concern).toBe('string');
                    expect(concern.length).toBeGreaterThan(5); // Meaningful concern
                }
            }
        });

        it('should have typical questions that are actually questions', () => {
            for (const persona of allPersonas) {
                expect(persona.typicalQuestions.length).toBeGreaterThanOrEqual(3);
                for (const question of persona.typicalQuestions) {
                    expect(typeof question).toBe('string');
                    expect(question.length).toBeGreaterThan(5);
                    // Most questions should contain a question word or end with '?'
                    const hasQuestionIndicator =
                        question.includes('?') ||
                        /\b(what|how|why|when|where|who|which|can|could|should|would|will|are|is|do|does)\b/i.test(question);
                    expect(hasQuestionIndicator).toBe(true);
                }
            }
        });
    });

    describe('Distinct Voice Characteristics', () => {
        it('should have unique communication styles across personas', () => {
            const styles = allPersonas.map(p => p.communication.style.toLowerCase());
            const uniqueStyles = new Set(styles);
            // Most personas should have distinct communication styles
            expect(uniqueStyles.size).toBeGreaterThan(allPersonas.length * 0.7);
        });

        it('should have meaningful communication styles', () => {
            for (const persona of allPersonas) {
                expect(persona.communication.style.length).toBeGreaterThan(10);
                // Should describe HOW they communicate
                expect(persona.communication.style).not.toBe(persona.communication.tone);
            }
        });

        it('should have meaningful communication tones', () => {
            for (const persona of allPersonas) {
                expect(persona.communication.tone.length).toBeGreaterThan(3);
            }
        });

        it('should have distinct perspectives reflecting persona expertise', () => {
            for (const persona of allPersonas) {
                expect(persona.perspective.length).toBeGreaterThan(20);
                // Perspective should be substantive and unique
                expect(persona.perspective).not.toBe(persona.background);
            }
        });

        it('should have biases that reflect potential blindspots', () => {
            for (const persona of allPersonas) {
                expect(persona.biases.length).toBeGreaterThanOrEqual(1);
                for (const bias of persona.biases) {
                    expect(bias.length).toBeGreaterThan(10);
                }
            }
        });
    });

    describe('Expertise Validation', () => {
        it('should have personas with non-overlapping primary expertise', () => {
            // Group personas by category
            const byCategory: Record<PersonaCategoryId, PredefinedPersona[]> = {
                technical: [],
                business: [],
                creative: [],
                general: []
            };

            for (const persona of allPersonas) {
                byCategory[persona.category].push(persona);
            }

            // Within each category, personas should have distinct primary focus
            for (const [category, personas] of Object.entries(byCategory)) {
                const firstExpertise = personas.map(p => p.expertise[0]?.toLowerCase() || '');
                const uniqueFirstExpertise = new Set(firstExpertise);

                // Primary expertise should be mostly unique within a category
                expect(uniqueFirstExpertise.size).toBeGreaterThan(personas.length * 0.7);
            }
        });

        it('should have relevant tags that match expertise areas', () => {
            for (const persona of allPersonas) {
                expect(persona.tags.length).toBeGreaterThanOrEqual(3);

                // Tags should be lowercase or kebab-case
                for (const tag of persona.tags) {
                    expect(tag).toMatch(/^[a-z0-9-]+$/);
                }
            }
        });

        it('should have use cases when provided', () => {
            for (const persona of allPersonas) {
                if (persona.useCases) {
                    expect(Array.isArray(persona.useCases)).toBe(true);
                    expect(persona.useCases.length).toBeGreaterThan(0);
                    for (const useCase of persona.useCases) {
                        expect(typeof useCase).toBe('string');
                        expect(useCase.length).toBeGreaterThan(10);
                    }
                }
            }
        });

        it('should have valid complementary persona references when provided', () => {
            const allIds = new Set(allPersonas.map(p => p.id));

            for (const persona of allPersonas) {
                if (persona.complementaryPersonas) {
                    expect(Array.isArray(persona.complementaryPersonas)).toBe(true);

                    for (const complementaryId of persona.complementaryPersonas) {
                        expect(typeof complementaryId).toBe('string');
                        // Complementary persona should exist
                        expect(allIds.has(complementaryId)).toBe(true);
                        // Should not reference itself
                        expect(complementaryId).not.toBe(persona.id);
                    }
                }
            }
        });
    });

    describe('Category-Specific Validation', () => {
        describe('Technical Personas', () => {
            it('should all have technical category', () => {
                for (const persona of technicalPersonas) {
                    expect(persona.category).toBe('technical');
                }
            });

            it('should have security specialist with security expertise', () => {
                expect(securitySpecialist.id).toBe('security-specialist');
                expect(securitySpecialist.expertise.some(e =>
                    e.toLowerCase().includes('security') ||
                    e.toLowerCase().includes('threat')
                )).toBe(true);
            });

            it('should have performance engineer with performance expertise', () => {
                expect(performanceEngineer.id).toBe('performance-engineer');
                expect(performanceEngineer.expertise.some(e =>
                    e.toLowerCase().includes('performance') ||
                    e.toLowerCase().includes('optimization')
                )).toBe(true);
            });

            it('should have UX researcher with user experience expertise', () => {
                expect(uxResearcher.id).toBe('ux-researcher');
                expect(uxResearcher.expertise.some(e =>
                    e.toLowerCase().includes('ux') ||
                    e.toLowerCase().includes('user') ||
                    e.toLowerCase().includes('usability')
                )).toBe(true);
            });

            it('should have DevOps expert with DevOps expertise', () => {
                expect(devopsExpert.id).toBe('devops-expert');
                expect(devopsExpert.expertise.some(e =>
                    e.toLowerCase().includes('devops') ||
                    e.toLowerCase().includes('ci/cd') ||
                    e.toLowerCase().includes('infrastructure')
                )).toBe(true);
            });
        });

        describe('Business Personas', () => {
            it('should all have business category', () => {
                for (const persona of businessPersonas) {
                    expect(persona.category).toBe('business');
                }
            });

            it('should have product manager with product expertise', () => {
                expect(productManager.id).toBe('product-manager');
                expect(productManager.expertise.some(e =>
                    e.toLowerCase().includes('product') ||
                    e.toLowerCase().includes('roadmap') ||
                    e.toLowerCase().includes('prioritization')
                )).toBe(true);
            });

            it('should have growth hacker with growth expertise', () => {
                expect(growthHacker.id).toBe('growth-hacker');
                expect(growthHacker.expertise.some(e =>
                    e.toLowerCase().includes('growth') ||
                    e.toLowerCase().includes('acquisition') ||
                    e.toLowerCase().includes('retention')
                )).toBe(true);
            });

            it('should have customer success with customer expertise', () => {
                expect(customerSuccess.id).toBe('customer-success');
                expect(customerSuccess.expertise.some(e =>
                    e.toLowerCase().includes('customer') ||
                    e.toLowerCase().includes('onboarding') ||
                    e.toLowerCase().includes('churn')
                )).toBe(true);
            });

            it('should have business analyst with analysis expertise', () => {
                expect(businessAnalyst.id).toBe('business-analyst');
                expect(businessAnalyst.expertise.some(e =>
                    e.toLowerCase().includes('requirements') ||
                    e.toLowerCase().includes('analysis') ||
                    e.toLowerCase().includes('process')
                )).toBe(true);
            });
        });

        describe('Creative Personas', () => {
            it('should all have creative category', () => {
                for (const persona of creativePersonas) {
                    expect(persona.category).toBe('creative');
                }
            });

            it('should have design thinker with design thinking expertise', () => {
                expect(designThinker.id).toBe('design-thinker');
                expect(designThinker.expertise.some(e =>
                    e.toLowerCase().includes('design') ||
                    e.toLowerCase().includes('empathy') ||
                    e.toLowerCase().includes('ideation')
                )).toBe(true);
            });

            it('should have storyteller with narrative expertise', () => {
                expect(storyteller.id).toBe('storyteller');
                expect(storyteller.expertise.some(e =>
                    e.toLowerCase().includes('story') ||
                    e.toLowerCase().includes('narrative') ||
                    e.toLowerCase().includes('communication')
                )).toBe(true);
            });

            it('should have brand strategist with branding expertise', () => {
                expect(brandStrategist.id).toBe('brand-strategist');
                expect(brandStrategist.expertise.some(e =>
                    e.toLowerCase().includes('brand') ||
                    e.toLowerCase().includes('positioning') ||
                    e.toLowerCase().includes('identity')
                )).toBe(true);
            });

            it('should have innovation catalyst with innovation expertise', () => {
                expect(innovationCatalyst.id).toBe('innovation-catalyst');
                expect(innovationCatalyst.expertise.some(e =>
                    e.toLowerCase().includes('innovation') ||
                    e.toLowerCase().includes('disruption') ||
                    e.toLowerCase().includes('blue ocean')
                )).toBe(true);
            });
        });

        describe('General Personas', () => {
            it('should all have general category', () => {
                for (const persona of generalPersonas) {
                    expect(persona.category).toBe('general');
                }
            });

            it('should have devils advocate with critical thinking expertise', () => {
                expect(devilsAdvocate.id).toBe('devils-advocate');
                expect(devilsAdvocate.expertise.some(e =>
                    e.toLowerCase().includes('critical') ||
                    e.toLowerCase().includes('assumption') ||
                    e.toLowerCase().includes('risk')
                )).toBe(true);
            });

            it('should have systems thinker with systems thinking expertise', () => {
                expect(systemsThinker.id).toBe('systems-thinker');
                expect(systemsThinker.expertise.some(e =>
                    e.toLowerCase().includes('system') ||
                    e.toLowerCase().includes('feedback') ||
                    e.toLowerCase().includes('interconnection')
                )).toBe(true);
            });
        });
    });

    describe('Persona Quality Metrics', () => {
        it('should have comprehensive personas with rich metadata', () => {
            for (const persona of allPersonas) {
                // Calculate a "richness score" for the persona
                const richnessScore =
                    persona.expertise.length +
                    persona.biases.length +
                    persona.tags.length +
                    persona.concerns.length +
                    persona.typicalQuestions.length +
                    (persona.useCases?.length || 0) +
                    (persona.complementaryPersonas?.length || 0);

                // Each persona should have substantial metadata
                expect(richnessScore).toBeGreaterThan(20);
            }
        });

        it('should have backgrounds that establish credibility', () => {
            for (const persona of allPersonas) {
                // Background should mention experience, credentials, or accomplishments
                const hasCredibility =
                    /\d+\+?\s*years?/i.test(persona.background) || // Years of experience
                    /experience|expert|specialist|background|worked|led|managed/i.test(persona.background);

                expect(hasCredibility).toBe(true);
            }
        });

        it('should have perspectives that convey worldview', () => {
            for (const persona of allPersonas) {
                // Perspective should be opinionated and reflect values
                expect(persona.perspective.length).toBeGreaterThan(30);
            }
        });

        it('should have diverse communication styles across all personas', () => {
            const styles = allPersonas.map(p =>
                `${p.communication.style.toLowerCase()} - ${p.communication.tone.toLowerCase()}`
            );
            const uniqueStyleToneCombos = new Set(styles);

            // Most personas should have unique style+tone combinations
            expect(uniqueStyleToneCombos.size).toBeGreaterThan(allPersonas.length * 0.8);
        });
    });

    describe('Cross-Persona Relationships', () => {
        it('should have reciprocal complementary relationships where applicable', () => {
            const complementaryMap = new Map<string, Set<string>>();

            // Build map of who complements whom
            for (const persona of allPersonas) {
                if (persona.complementaryPersonas) {
                    complementaryMap.set(
                        persona.id,
                        new Set(persona.complementaryPersonas)
                    );
                }
            }

            // Check for some reciprocal relationships (not all need to be reciprocal)
            let reciprocalCount = 0;
            for (const [personaId, complements] of complementaryMap.entries()) {
                for (const complementId of complements) {
                    const reverseComplements = complementaryMap.get(complementId);
                    if (reverseComplements?.has(personaId)) {
                        reciprocalCount++;
                    }
                }
            }

            // At least some relationships should be reciprocal
            expect(reciprocalCount).toBeGreaterThan(0);
        });

        it('should have cross-category complementary relationships', () => {
            let crossCategoryCount = 0;

            for (const persona of allPersonas) {
                if (persona.complementaryPersonas) {
                    for (const complementId of persona.complementaryPersonas) {
                        const complement = allPersonas.find(p => p.id === complementId);
                        if (complement && complement.category !== persona.category) {
                            crossCategoryCount++;
                        }
                    }
                }
            }

            // Should have some cross-category complementary relationships
            expect(crossCategoryCount).toBeGreaterThan(5);
        });
    });
});
