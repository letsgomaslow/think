import { DesignPatternData } from '../models/interfaces.js';
import { designPatternDataSchema } from '../schemas/pattern.js';
import { ZodError } from 'zod';
import chalk from 'chalk';

export class PatternServer {
  private validatePatternData(input: unknown): DesignPatternData {
    try {
      return designPatternDataSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Invalid pattern data: ${errorMessages}`);
      }
      throw error;
    }
  }

  private formatPatternOutput(data: DesignPatternData): string {
    const { patternName, context, implementation, benefits, tradeoffs, codeExample, languages } = data;
    
    let output = `\n${chalk.bold.blue('Design Pattern:')} ${chalk.bold(patternName)}\n`;
    output += `${chalk.bold.green('Context:')} ${context}\n`;
    
    if (implementation.length > 0) {
      output += `\n${chalk.bold.yellow('Implementation Steps:')}\n`;
      implementation.forEach((step, index) => {
        output += `${chalk.bold(`${index + 1}.`)} ${step}\n`;
      });
    }
    
    if (benefits.length > 0) {
      output += `\n${chalk.bold.magenta('Benefits:')}\n`;
      benefits.forEach((benefit, index) => {
        output += `${chalk.bold(`•`)} ${benefit}\n`;
      });
    }
    
    if (tradeoffs.length > 0) {
      output += `\n${chalk.bold.red('Trade-offs:')}\n`;
      tradeoffs.forEach((tradeoff, index) => {
        output += `${chalk.bold(`•`)} ${tradeoff}\n`;
      });
    }
    
    if (languages && languages.length > 0) {
      output += `\n${chalk.bold.cyan('Applicable Languages:')} ${languages.join(', ')}\n`;
    }
    
    if (codeExample) {
      output += `\n${chalk.bold.green('Code Example:')}\n${codeExample}\n`;
    }
    
    return output;
  }

  public processPattern(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validatePatternData(input);
      const formattedOutput = this.formatPatternOutput(validatedInput);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            patternName: validatedInput.patternName,
            status: 'success',
            hasImplementation: validatedInput.implementation.length > 0,
            hasCodeExample: !!validatedInput.codeExample
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
