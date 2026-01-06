import { MetacognitiveMonitoringData } from '../models/interfaces.js';
import chalk from 'chalk';

export class ReflectServer {
  private monitoringSessions: Record<string, MetacognitiveMonitoringData[]> = {};

  private validateInputData(input: unknown): MetacognitiveMonitoringData {
    const data = input as MetacognitiveMonitoringData;
    if (!data.task || !data.stage || !data.monitoringId) {
      throw new Error("Invalid input for MetacognitiveMonitoring: Missing required fields.");
    }
    if (typeof data.overallConfidence !== 'number' || data.overallConfidence < 0 || data.overallConfidence > 1) {
      throw new Error("Invalid overallConfidence value for MetacognitiveMonitoringData.");
    }
    if (typeof data.iteration !== 'number' || data.iteration < 0) {
      throw new Error("Invalid iteration value for MetacognitiveMonitoringData.");
    }
    if (typeof data.nextAssessmentNeeded !== 'boolean') {
      throw new Error("Invalid nextAssessmentNeeded value for MetacognitiveMonitoringData.");
    }
    return data;
  }

  private formatOutput(data: MetacognitiveMonitoringData): string {
    const { task, stage, overallConfidence, uncertaintyAreas, recommendedApproach, iteration } = data;
    
    let output = `\n${chalk.bold.blue('Metacognitive Monitoring')}\n`;
    output += `${chalk.bold.green('Task:')} ${task}\n`;
    output += `${chalk.bold.yellow('Stage:')} ${stage} (Iteration: ${iteration})\n`;
    output += `${chalk.bold.magenta('Overall Confidence:')} ${(overallConfidence * 100).toFixed(1)}%\n`;
    
    // Knowledge Assessment
    if (data.knowledgeAssessment) {
      const ka = data.knowledgeAssessment;
      output += `\n${chalk.bold.cyan('Knowledge Assessment:')}\n`;
      output += `${chalk.bold('Domain:')} ${ka.domain}\n`;
      output += `${chalk.bold('Level:')} ${ka.knowledgeLevel} (${(ka.confidenceScore * 100).toFixed(1)}% confidence)\n`;
      output += `${chalk.bold('Evidence:')} ${ka.supportingEvidence}\n`;
      
      if (ka.knownLimitations.length > 0) {
        output += `${chalk.bold('Known Limitations:')}\n`;
        ka.knownLimitations.forEach((limitation, i) => {
          output += `  ${chalk.bold(`${i+1}.`)} ${limitation}\n`;
        });
      }
    }
    
    // Claims
    if (data.claims && data.claims.length > 0) {
      output += `\n${chalk.bold.green('Claims:')}\n`;
      data.claims.forEach((claim, i) => {
        output += `${chalk.bold(`Claim ${i+1}:`)} ${claim.claim}\n`;
        output += `  ${chalk.bold('Status:')} ${claim.status} (${(claim.confidenceScore * 100).toFixed(1)}% confidence)\n`;
        output += `  ${chalk.bold('Evidence:')} ${claim.evidenceBasis}\n`;
        
        if (claim.alternativeInterpretations && claim.alternativeInterpretations.length > 0) {
          output += `  ${chalk.bold('Alternative Interpretations:')}\n`;
          claim.alternativeInterpretations.forEach((alt, j) => {
            output += `    ${chalk.bold(`${j+1}.`)} ${alt}\n`;
          });
        }
      });
    }
    
    // Reasoning Steps
    if (data.reasoningSteps && data.reasoningSteps.length > 0) {
      output += `\n${chalk.bold.yellow('Reasoning Steps:')}\n`;
      data.reasoningSteps.forEach((step, i) => {
        output += `${chalk.bold(`Step ${i+1}:`)} ${step.step}\n`;
        output += `  ${chalk.bold('Logical Validity:')} ${(step.logicalValidity * 100).toFixed(1)}%\n`;
        output += `  ${chalk.bold('Inference Strength:')} ${(step.inferenceStrength * 100).toFixed(1)}%\n`;
        
        if (step.assumptions.length > 0) {
          output += `  ${chalk.bold('Assumptions:')}\n`;
          step.assumptions.forEach((assumption, j) => {
            output += `    ${chalk.bold(`${j+1}.`)} ${assumption}\n`;
          });
        }
        
        if (step.potentialBiases.length > 0) {
          output += `  ${chalk.bold('Potential Biases:')}\n`;
          step.potentialBiases.forEach((bias, j) => {
            output += `    ${chalk.bold(`${j+1}.`)} ${bias}\n`;
          });
        }
      });
    }
    
    // Uncertainty Areas
    if (uncertaintyAreas.length > 0) {
      output += `\n${chalk.bold.red('Uncertainty Areas:')}\n`;
      uncertaintyAreas.forEach((area, i) => {
        output += `${chalk.bold(`${i+1}.`)} ${area}\n`;
      });
    }
    
    // Recommended Approach
    output += `\n${chalk.bold.cyan('Recommended Approach:')}\n${recommendedApproach}\n`;
    
    // Next Steps
    if (data.nextAssessmentNeeded) {
      output += `\n${chalk.green('Further assessment needed.')}\n`;
      if (data.suggestedAssessments && data.suggestedAssessments.length > 0) {
        output += `${chalk.bold('Suggested Assessments:')} ${data.suggestedAssessments.join(', ')}\n`;
      }
    } else {
      output += `\n${chalk.cyan('Assessment complete.')}\n`;
    }
    
    return output;
  }

  private storeAssessment(data: MetacognitiveMonitoringData): void {
    if (!this.monitoringSessions[data.monitoringId]) {
      this.monitoringSessions[data.monitoringId] = [];
    }
    this.monitoringSessions[data.monitoringId].push(data);
  }

  /**
   * Get the full history of assessments for a monitoring session
   * @param monitoringId - The unique identifier for the monitoring session
   * @returns Array of all MetacognitiveMonitoringData entries for this session
   */
  public getMonitoringHistory(monitoringId: string): MetacognitiveMonitoringData[] {
    return this.monitoringSessions[monitoringId] || [];
  }

  /**
   * Get confidence progression over time for a monitoring session
   * @param monitoringId - The unique identifier for the monitoring session
   * @returns Array showing how confidence changed across iterations
   */
  public getConfidenceProgression(monitoringId: string): {
    monitoringId: string;
    totalAssessments: number;
    confidenceChanges: Array<{
      iteration: number;
      stage: string;
      overallConfidence: number;
    }>;
    averageConfidence: number | null;
    confidenceTrend: 'increasing' | 'decreasing' | 'stable' | null;
  } {
    const history = this.monitoringSessions[monitoringId] || [];

    if (history.length === 0) {
      return {
        monitoringId,
        totalAssessments: 0,
        confidenceChanges: [],
        averageConfidence: null,
        confidenceTrend: null
      };
    }

    // Extract confidence values for each iteration
    const confidenceChanges = history.map(entry => ({
      iteration: entry.iteration,
      stage: entry.stage,
      overallConfidence: entry.overallConfidence
    }));

    // Calculate average confidence
    const totalConfidence = history.reduce((sum, entry) => sum + entry.overallConfidence, 0);
    const averageConfidence = totalConfidence / history.length;

    // Determine trend (compare first half to second half)
    let confidenceTrend: 'increasing' | 'decreasing' | 'stable' | null = null;
    if (history.length >= 2) {
      const firstConfidence = history[0].overallConfidence;
      const lastConfidence = history[history.length - 1].overallConfidence;
      const difference = lastConfidence - firstConfidence;

      if (difference > 0.05) {
        confidenceTrend = 'increasing';
      } else if (difference < -0.05) {
        confidenceTrend = 'decreasing';
      } else {
        confidenceTrend = 'stable';
      }
    }

    return {
      monitoringId,
      totalAssessments: history.length,
      confidenceChanges,
      averageConfidence,
      confidenceTrend
    };
  }

  public processMetacognitiveMonitoring(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedData = this.validateInputData(input);

      // Store the assessment for future reference
      this.storeAssessment(validatedData);

      const formattedOutput = this.formatOutput(validatedData);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            task: validatedData.task,
            stage: validatedData.stage,
            monitoringId: validatedData.monitoringId,
            iteration: validatedData.iteration,
            overallConfidence: validatedData.overallConfidence,
            nextAssessmentNeeded: validatedData.nextAssessmentNeeded,
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
