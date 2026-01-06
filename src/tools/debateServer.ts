import { ArgumentData } from '../models/interfaces.js';
import chalk from 'chalk';

export class DebateServer {
  private argumentChains: Record<string, ArgumentData[]> = {};
  private argumentToRoot: Record<string, string> = {};

  private validateInputData(input: unknown): ArgumentData {
    const data = input as ArgumentData;
    if (!data.claim || !data.premises || !data.conclusion || !data.argumentType) {
      throw new Error("Invalid input for StructuredArgumentation: Missing required fields.");
    }
    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      throw new Error("Invalid confidence value for ArgumentData.");
    }
    if (typeof data.nextArgumentNeeded !== 'boolean') {
      throw new Error("Invalid nextArgumentNeeded value for ArgumentData.");
    }
    return data;
  }

  private formatOutput(data: ArgumentData): string {
    const { claim, premises, conclusion, argumentType, confidence, nextArgumentNeeded } = data;
    
    let output = `\n${chalk.bold.blue('Structured Argumentation')}\n`;
    output += `${chalk.bold.green('Argument Type:')} ${argumentType}\n`;
    output += `${chalk.bold.yellow('Confidence:')} ${(confidence * 100).toFixed(1)}%\n`;
    
    // Claim
    output += `\n${chalk.bold.magenta('Claim:')}\n${claim}\n`;
    
    // Premises
    if (premises.length > 0) {
      output += `\n${chalk.bold.cyan('Premises:')}\n`;
      premises.forEach((premise, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${premise}\n`;
      });
    }
    
    // Conclusion
    output += `\n${chalk.bold.green('Conclusion:')}\n${conclusion}\n`;
    
    // Responds To
    if (data.respondsTo) {
      output += `\n${chalk.bold('Responds To:')} ${data.respondsTo}\n`;
    }
    
    // Supports
    if (data.supports && data.supports.length > 0) {
      output += `${chalk.bold('Supports:')} ${data.supports.join(', ')}\n`;
    }
    
    // Contradicts
    if (data.contradicts && data.contradicts.length > 0) {
      output += `${chalk.bold('Contradicts:')} ${data.contradicts.join(', ')}\n`;
    }
    
    // Strengths
    if (data.strengths && data.strengths.length > 0) {
      output += `\n${chalk.bold.green('Strengths:')}\n`;
      data.strengths.forEach((strength, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${strength}\n`;
      });
    }
    
    // Weaknesses
    if (data.weaknesses && data.weaknesses.length > 0) {
      output += `\n${chalk.bold.red('Weaknesses:')}\n`;
      data.weaknesses.forEach((weakness, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${weakness}\n`;
      });
    }
    
    // Next Argument
    if (nextArgumentNeeded) {
      output += `\n${chalk.green('Further argumentation needed.')}\n`;
      if (data.suggestedNextTypes && data.suggestedNextTypes.length > 0) {
        output += `${chalk.bold('Suggested Next Types:')} ${data.suggestedNextTypes.join(', ')}\n`;
      }
    } else {
      output += `\n${chalk.cyan('Argumentation complete.')}\n`;
    }
    
    return output;
  }

  private storeArgument(data: ArgumentData): void {
    const argumentId = data.argumentId || `arg-${Date.now()}`;

    if (!data.respondsTo) {
      // This is a root argument
      if (!this.argumentChains[argumentId]) {
        this.argumentChains[argumentId] = [];
      }
      this.argumentChains[argumentId].push(data);
      this.argumentToRoot[argumentId] = argumentId;
    } else {
      // This argument responds to another - find the root
      const rootId = this.argumentToRoot[data.respondsTo] || data.respondsTo;
      if (!this.argumentChains[rootId]) {
        this.argumentChains[rootId] = [];
      }
      this.argumentChains[rootId].push(data);
      this.argumentToRoot[argumentId] = rootId;
    }
  }

  /**
   * Get the full history of arguments in a debate chain
   * @param rootArgumentId - The unique identifier for the root argument of the debate chain
   * @returns Array of all ArgumentData entries for this debate chain
   */
  public getDebateHistory(rootArgumentId: string): ArgumentData[] {
    return this.argumentChains[rootArgumentId] || [];
  }

  /**
   * Get the tree structure of arguments and their responses
   * @param rootArgumentId - The unique identifier for the root argument of the debate chain
   * @returns Tree structure showing argument relationships
   */
  public getArgumentTree(rootArgumentId: string): {
    rootArgumentId: string;
    totalArguments: number;
    argumentTypes: string[];
    tree: Array<{
      argumentId: string;
      argumentType: string;
      claim: string;
      confidence: number;
      respondsTo: string | null;
      supports: string[];
      contradicts: string[];
      children: Array<{
        argumentId: string;
        argumentType: string;
        claim: string;
        relationshipType: 'response' | 'support' | 'contradiction';
      }>;
    }>;
  } {
    const history = this.argumentChains[rootArgumentId] || [];

    if (history.length === 0) {
      return {
        rootArgumentId,
        totalArguments: 0,
        argumentTypes: [],
        tree: []
      };
    }

    // Extract unique argument types
    const typesSet = new Set<string>();
    history.forEach(arg => typesSet.add(arg.argumentType));
    const argumentTypes = Array.from(typesSet);

    // Build tree structure
    const tree = history.map(arg => {
      // Find all arguments that respond to this one
      const responses = history.filter(a => a.respondsTo === arg.argumentId);

      // Find all arguments that this one supports or contradicts
      const supportedBy = history.filter(a =>
        arg.supports && arg.supports.includes(a.argumentId || '')
      );
      const contradictedBy = history.filter(a =>
        arg.contradicts && arg.contradicts.includes(a.argumentId || '')
      );

      // Combine children
      const children = [
        ...responses.map(a => ({
          argumentId: a.argumentId || '',
          argumentType: a.argumentType,
          claim: a.claim,
          relationshipType: 'response' as const
        })),
        ...supportedBy.map(a => ({
          argumentId: a.argumentId || '',
          argumentType: a.argumentType,
          claim: a.claim,
          relationshipType: 'support' as const
        })),
        ...contradictedBy.map(a => ({
          argumentId: a.argumentId || '',
          argumentType: a.argumentType,
          claim: a.claim,
          relationshipType: 'contradiction' as const
        }))
      ];

      return {
        argumentId: arg.argumentId || '',
        argumentType: arg.argumentType,
        claim: arg.claim,
        confidence: arg.confidence,
        respondsTo: arg.respondsTo || null,
        supports: arg.supports || [],
        contradicts: arg.contradicts || [],
        children
      };
    });

    return {
      rootArgumentId,
      totalArguments: history.length,
      argumentTypes,
      tree
    };
  }

  public processStructuredArgumentation(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedData = this.validateInputData(input);
      const processedData: ArgumentData = {
        ...validatedData,
        argumentId: validatedData.argumentId || `arg-${Date.now()}`,
        supports: validatedData.supports || [],
        contradicts: validatedData.contradicts || [],
        strengths: validatedData.strengths || [],
        weaknesses: validatedData.weaknesses || [],
        suggestedNextTypes: validatedData.suggestedNextTypes || []
      };

      // Store the argument for future reference
      this.storeArgument(processedData);

      const formattedOutput = this.formatOutput(processedData);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            argumentType: processedData.argumentType,
            claim: processedData.claim,
            confidence: processedData.confidence,
            nextArgumentNeeded: processedData.nextArgumentNeeded,
            argumentId: processedData.argumentId,
            status: 'success'
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}
