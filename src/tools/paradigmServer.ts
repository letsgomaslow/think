import { ProgrammingParadigmData } from '../models/interfaces.js';
import { programmingParadigmDataSchema } from '../schemas/paradigm.js';
import { ZodError } from 'zod';
import chalk from 'chalk';

export class ParadigmServer {
  private validateParadigmData(input: unknown): ProgrammingParadigmData {
    try {
      return programmingParadigmDataSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Invalid paradigm data: ${errorMessages}`);
      }
      throw error;
    }
  }

  private formatParadigmOutput(data: ProgrammingParadigmData): string {
    const { paradigmName, problem, approach, benefits, limitations, codeExample, languages } = data;
    
    let output = `\n${chalk.bold.blue('Programming Paradigm:')} ${chalk.bold(paradigmName)}\n`;
    output += `${chalk.bold.green('Problem:')} ${problem}\n`;
    
    if (approach && approach.length > 0) {
      output += `\n${chalk.bold.yellow('Approach:')}\n`;
      approach?.forEach((step, index) => {
        output += `${chalk.bold(`${index + 1}.`)} ${step}\n`;
      });
    }
    
    if (benefits && benefits.length > 0) {
      output += `\n${chalk.bold.magenta('Benefits:')}\n`;
      benefits?.forEach((benefit) => {
        output += `${chalk.bold(`•`)} ${benefit}\n`;
      });
    }
    
    if (limitations && limitations.length > 0) {
      output += `\n${chalk.bold.red('Limitations:')}\n`;
      limitations?.forEach((limitation) => {
        output += `${chalk.bold(`•`)} ${limitation}\n`;
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

  public processParadigm(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateParadigmData(input);
      const formattedOutput = this.formatParadigmOutput(validatedInput);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            paradigmName: validatedInput.paradigmName,
            status: 'success',
            hasApproach: validatedInput.approach || [].length > 0,
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
