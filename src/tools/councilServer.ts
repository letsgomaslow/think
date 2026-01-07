import { CollaborativeReasoningData, PersonaData, ServerResponse } from '../models/interfaces.js';
import chalk from 'chalk';
import { personaFactory } from '../personas/factory.js';
import { PersonaCategoryId } from '../personas/types.js';

/**
 * Response data for collaborative reasoning results
 */
interface CollaborativeReasoningResponse {
    topic: string;
    stage: string;
    activePersonaId: string;
    nextPersonaId?: string;
    sessionId: string;
    iteration: number;
    personaCount: number;
    contributionCount: number;
    consensusPointCount: number;
    hasDisagreements: boolean;
    hasFinalRecommendation: boolean;
    nextContributionNeeded: boolean;
}

interface CouncilInput {
  topic: string;
  personaCategory?: PersonaCategoryId;
  predefinedPersonas?: string[];
  personas?: PersonaData[];
  contributions: any[];
  stage: string;
  activePersonaId: string;
  nextPersonaId?: string;
  consensusPoints?: string[];
  disagreements?: any[];
  keyInsights?: string[];
  openQuestions?: string[];
  finalRecommendation?: string;
  sessionId: string;
  iteration: number;
  suggestedContributionTypes?: string[];
  nextContributionNeeded: boolean;
}

export class CouncilServer {
  /**
   * Resolve personas from predefined IDs and category
   * Merges predefined personas with custom personas
   */
  private resolvePersonas(input: CouncilInput): PersonaData[] {
    const personas: PersonaData[] = [];

    // 1. Add personas from predefinedPersonas array
    if (input.predefinedPersonas && input.predefinedPersonas.length > 0) {
      for (const personaId of input.predefinedPersonas) {
        try {
          const enhancedPersona = personaFactory.createFromPredefined(personaId);
          const basePersona = personaFactory.toBasePersonaData(enhancedPersona);
          personas.push(basePersona);
        } catch (error) {
          throw new Error(`Failed to resolve predefined persona '${personaId}': ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    // 2. Add personas from personaCategory
    if (input.personaCategory) {
      try {
        const categoryPersonas = personaFactory.createFromCategory(input.personaCategory);
        for (const enhancedPersona of categoryPersonas) {
          const basePersona = personaFactory.toBasePersonaData(enhancedPersona);
          // Only add if not already included from predefinedPersonas
          if (!personas.some(p => p.id === basePersona.id)) {
            personas.push(basePersona);
          }
        }
      } catch (error) {
        throw new Error(`Failed to resolve personas from category '${input.personaCategory}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 3. Add custom personas (if provided)
    if (input.personas && input.personas.length > 0) {
      for (const customPersona of input.personas) {
        // Check if this custom persona should override a predefined one
        const existingIndex = personas.findIndex(p => p.id === customPersona.id);
        if (existingIndex >= 0) {
          // Override the predefined persona with the custom one
          personas[existingIndex] = customPersona;
        } else {
          // Add as new persona
          personas.push(customPersona);
        }
      }
    }

    return personas;
  }

  private validateInputData(input: unknown): CollaborativeReasoningData {
    const data = input as CouncilInput;
    if (!data.topic || !data.contributions || !data.stage || !data.activePersonaId || !data.sessionId) {
      throw new Error("Invalid input for CollaborativeReasoning: Missing required fields.");
    }
    if (typeof data.iteration !== 'number' || data.iteration < 0) {
        throw new Error("Invalid iteration value for CollaborativeReasoningData.");
    }
    if (typeof data.nextContributionNeeded !== 'boolean') {
        throw new Error("Invalid nextContributionNeeded value for CollaborativeReasoningData.");
    }

    // Resolve personas from predefined IDs, category, or custom definitions
    const resolvedPersonas = this.resolvePersonas(data);

    if (resolvedPersonas.length === 0) {
      throw new Error("No personas provided. Please specify predefinedPersonas, personaCategory, or custom personas.");
    }

    // Return CollaborativeReasoningData with resolved personas
    return {
      topic: data.topic,
      personas: resolvedPersonas,
      contributions: data.contributions,
      stage: data.stage,
      activePersonaId: data.activePersonaId,
      nextPersonaId: data.nextPersonaId,
      consensusPoints: data.consensusPoints,
      disagreements: data.disagreements,
      keyInsights: data.keyInsights,
      openQuestions: data.openQuestions,
      finalRecommendation: data.finalRecommendation,
      sessionId: data.sessionId,
      iteration: data.iteration,
      suggestedContributionTypes: data.suggestedContributionTypes,
      nextContributionNeeded: data.nextContributionNeeded
    } as CollaborativeReasoningData;
  }

  private formatOutput(data: CollaborativeReasoningData): string {
    const { topic, personas, contributions, stage, activePersonaId, iteration } = data;
    
    let output = `\n${chalk.bold.blue('Collaborative Reasoning Session')}\n`;
    output += `${chalk.bold.green('Topic:')} ${topic}\n`;
    output += `${chalk.bold.yellow('Stage:')} ${stage} (Iteration: ${iteration})\n`;
    
    // Active persona
    const activePersona = personas.find(p => p.id === activePersonaId);
    if (activePersona) {
      output += `\n${chalk.bold.magenta('Active Persona:')} ${activePersona.name}\n`;
      output += `${chalk.bold.cyan('Expertise:')} ${activePersona.expertise.join(', ')}\n`;
      output += `${chalk.bold.cyan('Perspective:')} ${activePersona.perspective}\n`;
    }
    
    // Contributions
    if (contributions.length > 0) {
      output += `\n${chalk.bold.green('Contributions:')}\n`;
      
      for (const contribution of contributions) {
        const persona = personas.find(p => p.id === contribution.personaId);
        const personaName = persona ? persona.name : contribution.personaId;
        
        output += `${chalk.bold(`${personaName} (${contribution.type}, confidence: ${contribution.confidence.toFixed(2)}):`)} `;
        output += `${contribution.content}\n\n`;
      }
    }
    
    // Consensus points
    if (data.consensusPoints && data.consensusPoints.length > 0) {
      output += `\n${chalk.bold.green('Consensus Points:')}\n`;
      data.consensusPoints.forEach((point, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${point}\n`;
      });
    }
    
    // Key insights
    if (data.keyInsights && data.keyInsights.length > 0) {
      output += `\n${chalk.bold.yellow('Key Insights:')}\n`;
      data.keyInsights.forEach((insight, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${insight}\n`;
      });
    }
    
    // Final recommendation
    if (data.finalRecommendation) {
      output += `\n${chalk.bold.cyan('Final Recommendation:')}\n${data.finalRecommendation}\n`;
    }
    
    return output;
  }

  public processCollaborativeReasoning(input: unknown): ServerResponse<CollaborativeReasoningResponse> {
    try {
      const validatedData = this.validateInputData(input);

      // Log formatted output to console
      const formattedOutput = this.formatOutput(validatedData);
      console.error(formattedOutput);

      return {
        status: 'success',
        data: {
          topic: validatedData.topic,
          stage: validatedData.stage,
          activePersonaId: validatedData.activePersonaId,
          nextPersonaId: validatedData.nextPersonaId,
          sessionId: validatedData.sessionId,
          iteration: validatedData.iteration,
          personaCount: validatedData.personas.length,
          contributionCount: validatedData.contributions.length,
          consensusPointCount: validatedData.consensusPoints?.length ?? 0,
          hasDisagreements: (validatedData.disagreements?.length ?? 0) > 0,
          hasFinalRecommendation: !!validatedData.finalRecommendation,
          nextContributionNeeded: validatedData.nextContributionNeeded
        }
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
