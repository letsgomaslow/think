import { VisualElement, VisualOperationData } from '../models/interfaces.js';

export class MermaidGenerator {
  /**
   * Generate Mermaid syntax from VisualElement array based on diagram type
   */
  public generate(diagramType: VisualOperationData['diagramType'], elements: VisualElement[]): string {
    if (!elements || elements.length === 0) {
      return '';
    }

    switch (diagramType) {
      case 'sequenceDiagram':
        return this.generateSequenceDiagram(elements);
      case 'stateMachine':
        return this.generateStateMachine(elements);
      case 'erDiagram':
        return this.generateERDiagram(elements);
      case 'mindMap':
        return this.generateMindMap(elements);
      case 'contextDiagram':
        return this.generateContextDiagram(elements);
      case 'graph':
        return this.generateGraph(elements, 'TD');
      case 'flowchart':
        return this.generateFlowchart(elements);
      case 'stateDiagram':
        return this.generateStateDiagram(elements);
      case 'conceptMap':
        return this.generateConceptMap(elements);
      case 'treeDiagram':
        return this.generateTreeDiagram(elements);
      case 'custom':
        return this.generateCustom(elements);
      default:
        return '';
    }
  }

  /**
   * Generate Mermaid sequenceDiagram syntax
   * Nodes become participants, edges become messages with arrow notation
   */
  private generateSequenceDiagram(elements: VisualElement[]): string {
    const lines: string[] = ['sequenceDiagram'];

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add participants
    nodes.forEach(node => {
      const participantName = this.sanitizeId(node.id);
      const displayName = node.label || node.id;
      lines.push(`    participant ${participantName} as ${displayName}`);
    });

    // Add messages (edges)
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const label = edge.label || '';
        const arrowType = edge.properties?.arrowType || '->>';
        lines.push(`    ${from}${arrowType}${to}: ${label}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid stateDiagram-v2 syntax for state machines
   * Nodes become states, edges become transitions
   */
  private generateStateMachine(elements: VisualElement[]): string {
    const lines: string[] = ['stateDiagram-v2'];

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add states
    nodes.forEach(node => {
      const stateName = this.sanitizeId(node.id);
      if (node.properties?.isStart) {
        lines.push(`    [*] --> ${stateName}`);
      }
      if (node.label && node.label !== node.id) {
        lines.push(`    ${stateName}: ${node.label}`);
      }
      if (node.properties?.isEnd) {
        lines.push(`    ${stateName} --> [*]`);
      }
    });

    // Add transitions
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const label = edge.label ? `: ${edge.label}` : '';
        lines.push(`    ${from} --> ${to}${label}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid erDiagram syntax
   * Nodes become entities with attributes, edges become relationships
   */
  private generateERDiagram(elements: VisualElement[]): string {
    const lines: string[] = ['erDiagram'];

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add entities with attributes
    nodes.forEach(node => {
      const entityName = this.sanitizeId(node.id);
      lines.push(`    ${entityName} {`);

      const attributes = node.properties?.attributes;
      if (attributes && Array.isArray(attributes)) {
        attributes.forEach((attr: any) => {
          const attrType = attr.type || 'string';
          const attrName = attr.name || attr;
          const key = attr.key ? ' PK' : '';
          lines.push(`        ${attrType} ${attrName}${key}`);
        });
      }

      lines.push('    }');
    });

    // Add relationships
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const cardinality = edge.properties?.cardinality || '||--o{';
        const label = edge.label ? ` : "${edge.label}"` : '';
        lines.push(`    ${from} ${cardinality} ${to}${label}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid mindmap syntax
   * Root node at center, child nodes branch out via contains relationships
   */
  private generateMindMap(elements: VisualElement[]): string {
    const lines: string[] = ['mindmap'];

    const nodes = elements.filter(e => e.type === 'node');

    // Find root node (node with no incoming edges or marked as root)
    const rootNode = nodes.find(n => n.properties?.isRoot) || nodes[0];

    if (!rootNode) {
      return 'mindmap\n  root((Root))';
    }

    const processedNodes = new Set<string>();

    const addNode = (node: VisualElement, indent: number) => {
      if (processedNodes.has(node.id)) return;
      processedNodes.add(node.id);

      const indentStr = '  '.repeat(indent);
      const label = node.label || node.id;

      // Determine shape based on properties
      let nodeText = label;
      if (node.properties?.shape === 'circle') {
        nodeText = `((${label}))`;
      } else if (node.properties?.shape === 'square') {
        nodeText = `[${label}]`;
      } else if (node.properties?.shape === 'cloud') {
        nodeText = `)${label}(`;
      }

      lines.push(`${indentStr}${nodeText}`);

      // Process children
      if (node.contains && node.contains.length > 0) {
        node.contains.forEach(childId => {
          const childNode = nodes.find(n => n.id === childId);
          if (childNode) {
            addNode(childNode, indent + 1);
          }
        });
      }
    };

    addNode(rootNode, 1);

    return lines.join('\n');
  }

  /**
   * Generate Mermaid C4Context syntax for system context diagrams
   * Nodes become Person, System, or SystemDb based on type property
   */
  private generateContextDiagram(elements: VisualElement[]): string {
    const lines: string[] = ['C4Context'];
    lines.push('    title System Context Diagram');
    lines.push('');

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add nodes
    nodes.forEach(node => {
      const id = this.sanitizeId(node.id);
      const label = node.label || node.id;
      const description = node.properties?.description || '';
      const nodeType = node.properties?.nodeType || 'System';

      switch (nodeType) {
        case 'Person':
          lines.push(`    Person(${id}, "${label}", "${description}")`);
          break;
        case 'SystemDb':
          lines.push(`    SystemDb(${id}, "${label}", "${description}")`);
          break;
        case 'System_Ext':
          lines.push(`    System_Ext(${id}, "${label}", "${description}")`);
          break;
        default:
          lines.push(`    System(${id}, "${label}", "${description}")`);
      }
    });

    lines.push('');

    // Add relationships
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const label = edge.label || 'uses';
        const technology = edge.properties?.technology || '';
        lines.push(`    Rel(${from}, ${to}, "${label}", "${technology}")`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid graph syntax (existing type)
   */
  private generateGraph(elements: VisualElement[], direction: string = 'TD'): string {
    const lines: string[] = [`graph ${direction}`];

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add nodes
    nodes.forEach(node => {
      const id = this.sanitizeId(node.id);
      const label = node.label || node.id;
      const shape = this.getNodeShape(node);
      lines.push(`    ${id}${shape.start}${label}${shape.end}`);
    });

    // Add edges
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const label = edge.label ? `|${edge.label}|` : '';
        const arrow = edge.properties?.arrowType || '-->';
        lines.push(`    ${from} ${arrow} ${label} ${to}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid flowchart syntax (existing type)
   */
  private generateFlowchart(elements: VisualElement[]): string {
    const lines: string[] = ['flowchart LR'];

    const nodes = elements.filter(e => e.type === 'node');
    const edges = elements.filter(e => e.type === 'edge');

    // Add nodes
    nodes.forEach(node => {
      const id = this.sanitizeId(node.id);
      const label = node.label || node.id;
      const shape = this.getNodeShape(node);
      lines.push(`    ${id}${shape.start}${label}${shape.end}`);
    });

    // Add edges
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        const from = this.sanitizeId(edge.source);
        const to = this.sanitizeId(edge.target);
        const label = edge.label ? `|${edge.label}|` : '';
        const arrow = edge.properties?.arrowType || '-->';
        lines.push(`    ${from} ${arrow} ${label} ${to}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate Mermaid stateDiagram-v2 syntax (existing type)
   */
  private generateStateDiagram(elements: VisualElement[]): string {
    return this.generateStateMachine(elements);
  }

  /**
   * Generate Mermaid graph LR for concept maps (existing type)
   */
  private generateConceptMap(elements: VisualElement[]): string {
    return this.generateGraph(elements, 'LR');
  }

  /**
   * Generate Mermaid graph TD for tree diagrams (existing type)
   */
  private generateTreeDiagram(elements: VisualElement[]): string {
    return this.generateGraph(elements, 'TD');
  }

  /**
   * Generate Mermaid graph LR for custom diagrams (existing type)
   */
  private generateCustom(elements: VisualElement[]): string {
    return this.generateGraph(elements, 'LR');
  }

  /**
   * Sanitize node IDs for Mermaid compatibility
   * Replace spaces and special characters with underscores
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Determine node shape based on properties
   */
  private getNodeShape(node: VisualElement): { start: string; end: string } {
    const shape = node.properties?.shape;

    switch (shape) {
      case 'circle':
        return { start: '((', end: '))' };
      case 'round':
        return { start: '(', end: ')' };
      case 'stadium':
        return { start: '([', end: '])' };
      case 'subroutine':
        return { start: '[[', end: ']]' };
      case 'cylindrical':
        return { start: '[(', end: ')]' };
      case 'diamond':
        return { start: '{', end: '}' };
      case 'hexagon':
        return { start: '{{', end: '}}' };
      case 'parallelogram':
        return { start: '[/', end: '/]' };
      case 'trapezoid':
        return { start: '[\\', end: '\\]' };
      default:
        return { start: '[', end: ']' };
    }
  }
}
