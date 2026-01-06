import { DecisionFrameworkData, EisenhowerClassification, OptionData } from '../models/interfaces.js';
import chalk from 'chalk';

export class DecideServer {
  private validateInputData(input: unknown): DecisionFrameworkData {
    const data = input as DecisionFrameworkData;
    if (!data.decisionStatement || !data.options || !data.analysisType || !data.stage || !data.decisionId) {
      throw new Error("Invalid input for DecisionFramework: Missing required fields.");
    }
    if (typeof data.iteration !== 'number' || data.iteration < 0) {
        throw new Error("Invalid iteration value for DecisionFrameworkData.");
    }
    if (typeof data.nextStageNeeded !== 'boolean') {
        throw new Error("Invalid nextStageNeeded value for DecisionFrameworkData.");
    }
    return data;
  }

  private formatEisenhowerMatrix(data: DecisionFrameworkData): string {
    if (!data.eisenhowerClassification || data.eisenhowerClassification.length === 0) {
      return '';
    }

    const classifications = data.eisenhowerClassification;
    const options = data.options;

    // Group options by quadrant
    const quadrants = {
      'do-first': [] as { option: OptionData; classification: EisenhowerClassification }[],
      'schedule': [] as { option: OptionData; classification: EisenhowerClassification }[],
      'delegate': [] as { option: OptionData; classification: EisenhowerClassification }[],
      'eliminate': [] as { option: OptionData; classification: EisenhowerClassification }[]
    };

    classifications.forEach(classification => {
      const option = options.find(opt => opt.id === classification.optionId);
      if (option) {
        quadrants[classification.quadrant].push({ option, classification });
      }
    });

    let output = `\n${chalk.bold.blue('Eisenhower Matrix Analysis')}\n`;
    output += `${chalk.dim('━'.repeat(60))}\n`;

    // Do First quadrant (Urgent + Important)
    output += `\n${chalk.bold.red('🔴 DO FIRST')} ${chalk.dim('(Urgent + Important)')}\n`;
    if (quadrants['do-first'].length > 0) {
      quadrants['do-first'].forEach(({ option, classification }) => {
        output += `  ${chalk.bold('•')} ${chalk.bold(option.name)}\n`;
        output += `    ${option.description}\n`;
        output += `    ${chalk.yellow('Urgency:')} ${classification.urgency}/5  ${chalk.green('Importance:')} ${classification.importance}/5\n`;
      });
    } else {
      output += `  ${chalk.dim('No items in this quadrant')}\n`;
    }

    // Schedule quadrant (Important but not Urgent)
    output += `\n${chalk.bold.green('🟢 SCHEDULE')} ${chalk.dim('(Important, Not Urgent)')}\n`;
    if (quadrants['schedule'].length > 0) {
      quadrants['schedule'].forEach(({ option, classification }) => {
        output += `  ${chalk.bold('•')} ${chalk.bold(option.name)}\n`;
        output += `    ${option.description}\n`;
        output += `    ${chalk.yellow('Urgency:')} ${classification.urgency}/5  ${chalk.green('Importance:')} ${classification.importance}/5\n`;
      });
    } else {
      output += `  ${chalk.dim('No items in this quadrant')}\n`;
    }

    // Delegate quadrant (Urgent but not Important)
    output += `\n${chalk.bold.yellow('🟡 DELEGATE')} ${chalk.dim('(Urgent, Not Important)')}\n`;
    if (quadrants['delegate'].length > 0) {
      quadrants['delegate'].forEach(({ option, classification }) => {
        output += `  ${chalk.bold('•')} ${chalk.bold(option.name)}\n`;
        output += `    ${option.description}\n`;
        output += `    ${chalk.yellow('Urgency:')} ${classification.urgency}/5  ${chalk.green('Importance:')} ${classification.importance}/5\n`;
      });
    } else {
      output += `  ${chalk.dim('No items in this quadrant')}\n`;
    }

    // Eliminate quadrant (Neither Urgent nor Important)
    output += `\n${chalk.bold.gray('⚪ ELIMINATE')} ${chalk.dim('(Not Urgent, Not Important)')}\n`;
    if (quadrants['eliminate'].length > 0) {
      quadrants['eliminate'].forEach(({ option, classification }) => {
        output += `  ${chalk.bold('•')} ${chalk.bold(option.name)}\n`;
        output += `    ${option.description}\n`;
        output += `    ${chalk.yellow('Urgency:')} ${classification.urgency}/5  ${chalk.green('Importance:')} ${classification.importance}/5\n`;
      });
    } else {
      output += `  ${chalk.dim('No items in this quadrant')}\n`;
    }

    output += `\n${chalk.dim('━'.repeat(60))}\n`;

    return output;
  }

  private formatOutput(data: DecisionFrameworkData): string {
    const { decisionStatement, options, analysisType, stage, iteration } = data;

    let output = `\n${chalk.bold.blue('Decision Framework Analysis')}\n`;
    output += `${chalk.bold.green('Decision Statement:')} ${decisionStatement}\n`;
    output += `${chalk.bold.yellow('Analysis Type:')} ${analysisType}\n`;
    output += `${chalk.bold.magenta('Stage:')} ${stage} (Iteration: ${iteration})\n`;

    // Framework-specific formatting
    if (analysisType === 'eisenhower-matrix') {
      output += this.formatEisenhowerMatrix(data);
    } else {
      // Options
      if (options.length > 0) {
        output += `\n${chalk.bold.cyan('Options:')}\n`;
        options.forEach((option, i) => {
          output += `${chalk.bold(`Option ${i+1}: ${option.name}`)}\n`;
          output += `${option.description}\n\n`;
        });
      }
    }

    // Criteria
    if (data.criteria && data.criteria.length > 0) {
      output += `\n${chalk.bold.green('Criteria:')}\n`;
      data.criteria.forEach((criterion, i) => {
        output += `${chalk.bold(`${criterion.name} (weight: ${criterion.weight.toFixed(2)}):`)} `;
        output += `${criterion.description}\n`;
      });
    }

    // Stakeholders
    if (data.stakeholders && data.stakeholders.length > 0) {
      output += `\n${chalk.bold.yellow('Stakeholders:')} ${data.stakeholders.join(', ')}\n`;
    }

    // Constraints
    if (data.constraints && data.constraints.length > 0) {
      output += `\n${chalk.bold.red('Constraints:')}\n`;
      data.constraints.forEach((constraint, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${constraint}\n`;
      });
    }

    // Recommendation
    if (data.recommendation) {
      output += `\n${chalk.bold.green('Recommendation:')}\n${data.recommendation}\n`;

      if (data.rationale) {
        output += `\n${chalk.bold.cyan('Rationale:')}\n${data.rationale}\n`;
      }
    }

    return output;
  }

  public processDecisionFramework(input: unknown): DecisionFrameworkData {
    const validatedData = this.validateInputData(input);
    
    // Log formatted output to console
    const formattedOutput = this.formatOutput(validatedData);
    console.error(formattedOutput);
    
    return validatedData;
  }
}
