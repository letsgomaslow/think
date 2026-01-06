import { DecisionFrameworkData, EisenhowerClassification, OptionData, CostBenefitAnalysis, RiskItem, ReversibilityData } from '../models/interfaces.js';
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

  private formatCostBenefitAnalysis(data: DecisionFrameworkData): string {
    if (!data.costBenefitAnalysis || data.costBenefitAnalysis.length === 0) {
      return '';
    }

    const analyses = data.costBenefitAnalysis;
    const options = data.options;

    let output = `\n${chalk.bold.blue('Cost-Benefit Analysis')}\n`;
    output += `${chalk.dim('━'.repeat(60))}\n`;

    analyses.forEach(analysis => {
      const option = options.find(opt => opt.id === analysis.optionId);
      if (!option) return;

      output += `\n${chalk.bold.cyan(`Option: ${option.name}`)}\n`;
      output += `${chalk.dim(option.description)}\n`;

      // Costs section
      output += `\n${chalk.bold.red('Costs:')}\n`;
      if (analysis.costs && analysis.costs.length > 0) {
        let totalCosts = 0;
        analysis.costs.forEach(cost => {
          const typeLabel = cost.type === 'monetary' ? '💵' : '⚖️';
          const categoryLabel = cost.category ? ` [${cost.category}]` : '';
          const timeframeLabel = cost.timeframe ? ` (${cost.timeframe})` : '';
          output += `  ${typeLabel} ${cost.description}${categoryLabel}${timeframeLabel}\n`;
          output += `     ${chalk.red(`-$${cost.amount.toLocaleString()}`)}\n`;
          totalCosts += cost.amount;
        });
        output += `  ${chalk.bold.red(`Total Costs: -$${totalCosts.toLocaleString()}`)}\n`;
      } else {
        output += `  ${chalk.dim('No costs identified')}\n`;
      }

      // Benefits section
      output += `\n${chalk.bold.green('Benefits:')}\n`;
      if (analysis.benefits && analysis.benefits.length > 0) {
        let totalBenefits = 0;
        analysis.benefits.forEach(benefit => {
          const typeLabel = benefit.type === 'monetary' ? '💵' : '⚖️';
          const categoryLabel = benefit.category ? ` [${benefit.category}]` : '';
          const timeframeLabel = benefit.timeframe ? ` (${benefit.timeframe})` : '';
          output += `  ${typeLabel} ${benefit.description}${categoryLabel}${timeframeLabel}\n`;
          output += `     ${chalk.green(`+$${benefit.amount.toLocaleString()}`)}\n`;
          totalBenefits += benefit.amount;
        });
        output += `  ${chalk.bold.green(`Total Benefits: +$${totalBenefits.toLocaleString()}`)}\n`;
      } else {
        output += `  ${chalk.dim('No benefits identified')}\n`;
      }

      // Summary metrics
      output += `\n${chalk.bold.yellow('Summary Metrics:')}\n`;

      // Net Value
      const netValueColor = analysis.netValue >= 0 ? chalk.green : chalk.red;
      const netValueSign = analysis.netValue >= 0 ? '+' : '';
      output += `  ${chalk.bold('Net Value:')} ${netValueColor(`${netValueSign}$${analysis.netValue.toLocaleString()}`)}\n`;

      // Benefit-Cost Ratio
      if (analysis.benefitCostRatio !== undefined) {
        const ratioColor = analysis.benefitCostRatio >= 1 ? chalk.green : chalk.red;
        output += `  ${chalk.bold('Benefit-Cost Ratio:')} ${ratioColor(analysis.benefitCostRatio.toFixed(2))}\n`;
      }

      // ROI
      if (analysis.roi !== undefined) {
        const roiColor = analysis.roi >= 0 ? chalk.green : chalk.red;
        const roiSign = analysis.roi >= 0 ? '+' : '';
        output += `  ${chalk.bold('ROI:')} ${roiColor(`${roiSign}${analysis.roi.toFixed(1)}%`)}\n`;
      }

      // NPV (if discount rate and time period are provided)
      if (analysis.npv !== undefined && analysis.discountRate !== undefined && analysis.timePeriodYears !== undefined) {
        const npvColor = analysis.npv >= 0 ? chalk.green : chalk.red;
        const npvSign = analysis.npv >= 0 ? '+' : '';
        output += `  ${chalk.bold('NPV:')} ${npvColor(`${npvSign}$${analysis.npv.toLocaleString()}`)} `;
        output += chalk.dim(`(discount rate: ${(analysis.discountRate * 100).toFixed(1)}%, period: ${analysis.timePeriodYears} years)`);
        output += '\n';
      }

      output += `\n${chalk.dim('─'.repeat(60))}\n`;
    });

    return output;
  }

  private formatRiskAssessment(data: DecisionFrameworkData): string {
    if (!data.riskAssessment || data.riskAssessment.length === 0) {
      return '';
    }

    const risks = data.riskAssessment;
    const options = data.options;

    let output = `\n${chalk.bold.blue('Risk Assessment Matrix')}\n`;
    output += `${chalk.dim('━'.repeat(60))}\n`;

    // Helper function to determine risk level and color
    const getRiskLevel = (riskScore: number): { level: string; color: any; emoji: string } => {
      // Risk score = probability (0-1) × impact (1-10) = max 10
      if (riskScore >= 7) {
        return { level: 'CRITICAL', color: chalk.red.bold, emoji: '🔴' };
      } else if (riskScore >= 4) {
        return { level: 'HIGH', color: chalk.red, emoji: '🟠' };
      } else if (riskScore >= 2) {
        return { level: 'MEDIUM', color: chalk.yellow, emoji: '🟡' };
      } else {
        return { level: 'LOW', color: chalk.green, emoji: '🟢' };
      }
    };

    // Group risks by option
    const risksByOption = new Map<string, RiskItem[]>();
    risks.forEach(risk => {
      if (!risksByOption.has(risk.optionId)) {
        risksByOption.set(risk.optionId, []);
      }
      risksByOption.get(risk.optionId)!.push(risk);
    });

    // Display risks for each option
    risksByOption.forEach((optionRisks, optionId) => {
      const option = options.find(opt => opt.id === optionId);
      if (!option) return;

      output += `\n${chalk.bold.cyan(`Option: ${option.name}`)}\n`;
      output += `${chalk.dim(option.description)}\n`;

      // Sort risks by risk score (highest first)
      const sortedRisks = [...optionRisks].sort((a, b) => b.riskScore - a.riskScore);

      output += `\n${chalk.bold('Risk Items:')}\n`;
      sortedRisks.forEach(risk => {
        const { level, color, emoji } = getRiskLevel(risk.riskScore);

        output += `\n  ${emoji} ${color(level)} ${chalk.bold('Risk:')}\n`;
        output += `     ${risk.description}\n`;

        const categoryLabel = risk.category ? ` [${risk.category}]` : '';
        output += `     ${chalk.yellow('Probability:')} ${(risk.probability * 100).toFixed(0)}%  `;
        output += `${chalk.magenta('Impact:')} ${risk.impact.toFixed(1)}/10${categoryLabel}\n`;
        output += `     ${chalk.cyan('Risk Score:')} ${color(risk.riskScore.toFixed(2))}\n`;

        if (risk.mitigation && risk.mitigation.length > 0) {
          output += `     ${chalk.green('Mitigation Strategies:')}\n`;
          risk.mitigation.forEach(strategy => {
            output += `       • ${strategy}\n`;
          });
        }
      });

      // Risk summary for this option
      const avgRiskScore = optionRisks.reduce((sum, r) => sum + r.riskScore, 0) / optionRisks.length;
      const maxRiskScore = Math.max(...optionRisks.map(r => r.riskScore));
      const criticalRisks = optionRisks.filter(r => r.riskScore >= 7).length;
      const highRisks = optionRisks.filter(r => r.riskScore >= 4 && r.riskScore < 7).length;

      output += `\n  ${chalk.bold.yellow('Risk Summary:')}\n`;
      output += `     Total Risks: ${optionRisks.length}  `;
      output += `Critical: ${criticalRisks}  High: ${highRisks}\n`;
      output += `     Average Risk Score: ${avgRiskScore.toFixed(2)}  `;
      output += `Maximum Risk Score: ${maxRiskScore.toFixed(2)}\n`;

      output += `\n${chalk.dim('─'.repeat(60))}\n`;
    });

    // Overall risk matrix visualization
    output += `\n${chalk.bold.blue('Risk Matrix Visualization')}\n`;
    output += `${chalk.dim('Probability vs Impact')}\n\n`;
    output += `  ${chalk.bold('Impact →')}\n`;
    output += `  Probability ↓     Low(1-3)  Medium(4-6)  High(7-10)\n`;
    output += `  ────────────────────────────────────────────────────\n`;
    output += `  High (70-100%)    ${chalk.yellow('MEDIUM')}    ${chalk.red('HIGH')}      ${chalk.red.bold('CRITICAL')}\n`;
    output += `  Medium (30-70%)   ${chalk.green('LOW')}       ${chalk.yellow('MEDIUM')}    ${chalk.red('HIGH')}\n`;
    output += `  Low (0-30%)       ${chalk.green('LOW')}       ${chalk.green('LOW')}       ${chalk.yellow('MEDIUM')}\n`;
    output += `\n`;

    return output;
  }

  private formatReversibilityAnalysis(data: DecisionFrameworkData): string {
    if (!data.reversibilityAnalysis || data.reversibilityAnalysis.length === 0) {
      return '';
    }

    const analyses = data.reversibilityAnalysis;
    const options = data.options;

    let output = `\n${chalk.bold.blue('Reversibility Analysis')}\n`;
    output += `${chalk.dim('━'.repeat(60))}\n`;
    output += `${chalk.dim('Analyzing decision reversibility: one-way vs two-way doors')}\n`;

    analyses.forEach(analysis => {
      const option = options.find(opt => opt.id === analysis.optionId);
      if (!option) return;

      output += `\n${chalk.bold.cyan(`Option: ${option.name}`)}\n`;
      output += `${chalk.dim(option.description)}\n\n`;

      // Door type classification with color coding and emoji
      const isDoorTwoWay = analysis.doorType === 'two-way';
      const doorColor = isDoorTwoWay ? chalk.green.bold : chalk.red.bold;
      const doorEmoji = isDoorTwoWay ? '🚪↔️' : '🚪→';
      const doorLabel = isDoorTwoWay ? 'TWO-WAY DOOR' : 'ONE-WAY DOOR';

      output += `  ${doorEmoji} ${doorColor(doorLabel)}\n`;

      if (isDoorTwoWay) {
        output += `  ${chalk.green('This decision can be easily reversed if needed.')}\n`;
      } else {
        output += `  ${chalk.red('This decision is difficult or costly to reverse.')}\n`;
      }

      // Reversibility metrics
      output += `\n  ${chalk.bold('Reversibility Metrics:')}\n`;

      // Reversibility Score
      const scoreColor = analysis.reversibilityScore >= 0.7 ? chalk.green :
                         analysis.reversibilityScore >= 0.4 ? chalk.yellow : chalk.red;
      const scorePercentage = (analysis.reversibilityScore * 100).toFixed(0);
      output += `     ${chalk.bold('Reversibility Score:')} ${scoreColor(`${scorePercentage}%`)}\n`;

      // Undo Cost
      const costColor = analysis.undoCost < 1000 ? chalk.green :
                        analysis.undoCost < 10000 ? chalk.yellow : chalk.red;
      output += `     ${chalk.bold('Undo Cost:')} ${costColor(`$${analysis.undoCost.toLocaleString()}`)}\n`;

      // Time to Reverse
      const timeColor = analysis.timeToReverse < 7 ? chalk.green :
                        analysis.timeToReverse < 30 ? chalk.yellow : chalk.red;
      const timeUnit = analysis.timeToReverse === 1 ? 'day' : 'days';
      output += `     ${chalk.bold('Time to Reverse:')} ${timeColor(`${analysis.timeToReverse} ${timeUnit}`)}\n`;

      // Optional: Undo Complexity
      if (analysis.undoComplexity) {
        output += `     ${chalk.bold('Complexity:')} ${analysis.undoComplexity}\n`;
      }

      // Decision Speed Recommendation
      output += `\n  ${chalk.bold.yellow('Decision Speed Recommendation:')}\n`;
      if (isDoorTwoWay && analysis.reversibilityScore >= 0.7) {
        output += `     ${chalk.green('⚡ MOVE FAST')} - Low risk, easily reversible\n`;
        output += `     ${chalk.dim('You can make this decision quickly and adjust later if needed.')}\n`;
      } else if (isDoorTwoWay) {
        output += `     ${chalk.yellow('⚖️  MODERATE PACE')} - Reversible but with some cost\n`;
        output += `     ${chalk.dim('Take reasonable time, but don\'t over-analyze.')}\n`;
      } else if (!isDoorTwoWay && analysis.reversibilityScore < 0.3) {
        output += `     ${chalk.red('🐌 MOVE SLOW')} - High stakes, difficult to reverse\n`;
        output += `     ${chalk.dim('This is a one-way door. Invest significant time in this decision.')}\n`;
      } else {
        output += `     ${chalk.yellow('🤔 PROCEED WITH CAUTION')} - One-way door with moderate reversibility\n`;
        output += `     ${chalk.dim('Careful consideration needed, but avoid analysis paralysis.')}\n`;
      }

      // Optional: Reversibility Notes
      if (analysis.reversibilityNotes) {
        output += `\n  ${chalk.bold.cyan('Notes:')}\n`;
        output += `     ${analysis.reversibilityNotes}\n`;
      }

      output += `\n${chalk.dim('─'.repeat(60))}\n`;
    });

    // Summary guidance
    output += `\n${chalk.bold.blue('Bezos\'s Two-Way Door Framework:')}\n`;
    output += `${chalk.dim('One-way doors:')} Irreversible decisions requiring careful deliberation\n`;
    output += `${chalk.dim('Two-way doors:')} Reversible decisions where speed matters more than perfection\n`;
    output += `\n`;

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
    } else if (analysisType === 'cost-benefit') {
      output += this.formatCostBenefitAnalysis(data);
    } else if (analysisType === 'risk-assessment') {
      output += this.formatRiskAssessment(data);
    } else if (analysisType === 'reversibility') {
      output += this.formatReversibilityAnalysis(data);
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
