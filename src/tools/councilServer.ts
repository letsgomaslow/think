import { CollaborativeReasoningData, PersonaData } from '../models/interfaces.js';
import { collaborativeReasoningDataSchema } from '../schemas/council.js';
import { ZodError } from 'zod';
import chalk from 'chalk';
import { personaFactory } from '../personas/factory.js';
import { PersonaCategoryId } from '../personas/types.js';

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

    // Resolve personas from predefined IDs, category, or custom definitions
    const resolvedPersonas = this.resolvePersonas(data);

    if (resolvedPersonas.length === 0) {
      throw new Error("No personas provided. Please specify predefinedPersonas, personaCategory, or custom personas.");
    }

    // Build CollaborativeReasoningData with resolved personas
    const collaborativeReasoningData = {
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
    };

    // Validate with Zod schema
    try {
      return collaborativeReasoningDataSchema.parse(collaborativeReasoningData) as CollaborativeReasoningData;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Invalid collaborative reasoning data: ${errorMessages}`);
      }
      throw error;
    }
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

  public processCollaborativeReasoning(input: unknown): CollaborativeReasoningData {
    const validatedData = this.validateInputData(input);
    
    // Log formatted output to console
    const formattedOutput = this.formatOutput(validatedData);
    console.error(formattedOutput);
    
    return validatedData;
  }
}
