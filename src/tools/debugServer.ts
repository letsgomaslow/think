import { DebuggingApproachData } from '../models/interfaces.js';
import { debuggingApproachDataSchema } from '../schemas/debug.js';
import { ZodError } from 'zod';
import chalk from 'chalk';

export class DebugServer {
  private validateApproachData(input: unknown): DebuggingApproachData {
    try {
      return debuggingApproachDataSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Invalid approach data: ${errorMessages}`);
      }
      throw error;
    }
  }

  private formatApproachOutput(data: DebuggingApproachData): string {
    const { approachName, issue, steps, findings, resolution } = data;
    
    let output = `\n${chalk.bold.blue('Debugging Approach:')} ${chalk.bold(approachName)}\n`;
    output += `${chalk.bold.green('Issue:')} ${issue}\n`;
    
    if (steps.length > 0) {
      output += `\n${chalk.bold.yellow('Steps:')}\n`;
      steps.forEach((step, index) => {
        output += `${chalk.bold(`${index + 1}.`)} ${step}\n`;
      });
    }
    
    if (findings) {
      output += `\n${chalk.bold.magenta('Findings:')}\n${findings}\n`;
    }
    
    if (resolution) {
      output += `\n${chalk.bold.cyan('Resolution:')}\n${resolution}\n`;
    }
    
    return output;
  }

  public processApproach(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateApproachData(input);
      const formattedOutput = this.formatApproachOutput(validatedInput);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            approachName: validatedInput.approachName,
            status: 'success',
            hasSteps: validatedInput.steps.length > 0,
            hasResolution: !!validatedInput.resolution
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
