import { VisualOperationData, VisualElement } from '../models/interfaces.js';
import chalk from 'chalk';

export class MapServer {
  private diagrams: Record<string, VisualOperationData[]> = {};

  private validateInputData(input: unknown): VisualOperationData {
    const data = input as VisualOperationData;
    if (!data.operation || !data.diagramId || !data.diagramType) {
      throw new Error("Invalid input for VisualReasoning: Missing required fields.");
    }
    if (typeof data.iteration !== 'number' || data.iteration < 0) {
      throw new Error("Invalid iteration value for VisualOperationData.");
    }
    if (typeof data.nextOperationNeeded !== 'boolean') {
      throw new Error("Invalid nextOperationNeeded value for VisualOperationData.");
    }
    return data;
  }

  private formatOutput(data: VisualOperationData): string {
    const { operation, diagramId, diagramType, iteration, nextOperationNeeded } = data;
    
    let output = `\n${chalk.bold.blue('Visual Reasoning')}\n`;
    output += `${chalk.bold.green('Operation:')} ${operation}\n`;
    output += `${chalk.bold.yellow('Diagram ID:')} ${diagramId}\n`;
    output += `${chalk.bold.magenta('Diagram Type:')} ${diagramType}\n`;
    output += `${chalk.bold.cyan('Iteration:')} ${iteration}\n`;
    
    // Elements
    if (data.elements && data.elements.length > 0) {
      output += `\n${chalk.bold.green('Elements:')}\n`;
      data.elements.forEach((element, i) => {
        output += `${chalk.bold(`Element ${i+1}: ${element.id} (${element.type})`)}\n`;
        if (element.label) {
          output += `  ${chalk.bold('Label:')} ${element.label}\n`;
        }
        
        if (element.source) {
          output += `  ${chalk.bold('Source:')} ${element.source}\n`;
        }
        
        if (element.target) {
          output += `  ${chalk.bold('Target:')} ${element.target}\n`;
        }
        
        if (element.contains && element.contains.length > 0) {
          output += `  ${chalk.bold('Contains:')} ${element.contains.join(', ')}\n`;
        }
        
        const propKeys = Object.keys(element.properties);
        if (propKeys.length > 0) {
          output += `  ${chalk.bold('Properties:')}\n`;
          propKeys.forEach(key => {
            output += `    ${chalk.bold(`${key}:`)} ${JSON.stringify(element.properties[key])}\n`;
          });
        }
      });
    }
    
    // Transform Type
    if (data.transformationType) {
      output += `\n${chalk.bold('Transform Type:')} ${data.transformationType}\n`;
    }
    
    // Observation
    if (data.observation) {
      output += `\n${chalk.bold.yellow('Observation:')}\n${data.observation}\n`;
    }
    
    // Insight
    if (data.insight) {
      output += `\n${chalk.bold.magenta('Insight:')}\n${data.insight}\n`;
    }
    
    // Hypothesis
    if (data.hypothesis) {
      output += `\n${chalk.bold.cyan('Hypothesis:')}\n${data.hypothesis}\n`;
    }
    
    // Next Operation
    if (nextOperationNeeded) {
      output += `\n${chalk.green('Further visual operations needed.')}\n`;
    } else {
      output += `\n${chalk.cyan('Visual reasoning complete.')}\n`;
    }
    
    return output;
  }

  private storeOperation(data: VisualOperationData): void {
    const diagramId = data.diagramId;
    if (!this.diagrams[diagramId]) {
      this.diagrams[diagramId] = [];
    }
    this.diagrams[diagramId].push(data);
  }

  /**
   * Get the complete history of operations for a diagram
   * @param diagramId - The unique identifier for the diagram
   * @returns Array of all operations for the diagram
   */
  public getDiagramHistory(diagramId: string): VisualOperationData[] {
    return this.diagrams[diagramId] || [];
  }

  /**
   * Get the current state of all elements in a diagram
   * Aggregates operations (create/update/delete) to build current element state
   * @param diagramId - The unique identifier for the diagram
   * @returns Current state with elements, diagram type, and total operations
   */
  public getCurrentDiagramState(diagramId: string): {
    diagramId: string;
    diagramType: string | null;
    totalOperations: number;
    elements: Record<string, VisualElement>;
    lastOperation: string | null;
    lastIteration: number | null;
  } {
    const history = this.diagrams[diagramId] || [];

    if (history.length === 0) {
      return {
        diagramId,
        diagramType: null,
        totalOperations: 0,
        elements: {},
        lastOperation: null,
        lastIteration: null
      };
    }

    // Build current element state by processing operations in order
    const elements: Record<string, VisualElement> = {};
    let diagramType: string | null = null;
    let lastOperation: string | null = null;
    let lastIteration: number | null = null;

    history.forEach(operation => {
      // Track diagram type (should be consistent across operations)
      if (!diagramType) {
        diagramType = operation.diagramType;
      }

      lastOperation = operation.operation;
      lastIteration = operation.iteration;

      // Process elements based on operation type
      if (operation.elements && operation.elements.length > 0) {
        operation.elements.forEach(element => {
          if (operation.operation === 'create') {
            // Create new element
            elements[element.id] = { ...element };
          } else if (operation.operation === 'update') {
            // Update existing element (merge properties)
            if (elements[element.id]) {
              elements[element.id] = {
                ...elements[element.id],
                ...element,
                properties: {
                  ...elements[element.id].properties,
                  ...element.properties
                }
              };
            } else {
              // If element doesn't exist, treat update as create
              elements[element.id] = { ...element };
            }
          } else if (operation.operation === 'delete') {
            // Delete element
            delete elements[element.id];
          } else if (operation.operation === 'transform') {
            // Transform updates existing elements
            if (elements[element.id]) {
              elements[element.id] = {
                ...elements[element.id],
                ...element,
                properties: {
                  ...elements[element.id].properties,
                  ...element.properties
                }
              };
            }
          }
          // 'observe' operation doesn't change element state
        });
      }
    });

    return {
      diagramId,
      diagramType,
      totalOperations: history.length,
      elements,
      lastOperation,
      lastIteration
    };
  }

  public processVisualReasoning(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedData = this.validateInputData(input);
      const processedData: VisualOperationData = {
        ...validatedData,
        elements: validatedData.elements || []
      };

      // Store the operation for future reference
      this.storeOperation(processedData);

      const formattedOutput = this.formatOutput(processedData);
      console.error(formattedOutput);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            operation: processedData.operation,
            diagramId: processedData.diagramId,
            diagramType: processedData.diagramType,
            iteration: processedData.iteration,
            nextOperationNeeded: processedData.nextOperationNeeded,
            elementCount: processedData.elements ? processedData.elements.length : 0,
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
