import { describe, it, expect, beforeEach } from 'vitest';
import { DebateServer } from './debateServer.js';

describe('DebateServer', () => {
  let server: DebateServer;

  beforeEach(() => {
    server = new DebateServer();
  });

  const validInput = {
    claim: 'Remote work improves productivity',
    premises: [
      'Employees have fewer interruptions',
      'No commute saves time and energy',
      'Flexible schedules improve work-life balance',
    ],
    conclusion: 'Companies should embrace remote work policies',
    argumentType: 'thesis' as const,
    confidence: 0.8,
    nextArgumentNeeded: true,
  };

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid structured argumentation data', () => {
    const result = server.processStructuredArgumentation(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.claim).toBe('Remote work improves productivity');
    expect(parsed.argumentType).toBe('thesis');
    expect(parsed.confidence).toBe(0.8);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processStructuredArgumentation({
      claim: 'test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: 1.5,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: -0.1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid nextArgumentNeeded type', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      nextArgumentNeeded: 'yes',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle all argument types', () => {
    const types = [
      'thesis',
      'antithesis',
      'synthesis',
      'objection',
      'rebuttal',
    ] as const;

    types.forEach(argumentType => {
      const result = server.processStructuredArgumentation({
        ...validInput,
        argumentType,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.argumentType).toBe(argumentType);
    });
  });

  it('should handle optional argument relationships', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      argumentId: 'arg-1',
      respondsTo: 'arg-0',
      supports: ['arg-2', 'arg-3'],
      contradicts: ['arg-4'],
      strengths: ['Well-supported by data'],
      weaknesses: ['Limited sample size'],
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.argumentId).toBe('arg-1');
  });

  describe('State Persistence', () => {
    describe('Argument Chain Storage', () => {
      it('should store multiple arguments in a thesis-antithesis-synthesis chain', () => {
        // Create thesis (root argument)
        const thesis = server.processStructuredArgumentation({
          argumentId: 'arg-thesis',
          claim: 'Remote work improves productivity',
          premises: [
            'Employees have fewer interruptions',
            'No commute saves time',
          ],
          conclusion: 'Companies should embrace remote work',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });
        expect(parseResult(thesis).status).toBe('success');

        // Create antithesis responding to thesis
        const antithesis = server.processStructuredArgumentation({
          argumentId: 'arg-antithesis',
          claim: 'Remote work reduces collaboration',
          premises: [
            'Face-to-face communication is lost',
            'Team cohesion suffers',
          ],
          conclusion: 'Remote work has significant drawbacks',
          argumentType: 'antithesis' as const,
          confidence: 0.75,
          respondsTo: 'arg-thesis',
          contradicts: ['arg-thesis'],
          nextArgumentNeeded: true,
        });
        expect(parseResult(antithesis).status).toBe('success');

        // Create synthesis responding to antithesis
        const synthesis = server.processStructuredArgumentation({
          argumentId: 'arg-synthesis',
          claim: 'Hybrid work balances productivity and collaboration',
          premises: [
            'Remote work for focus tasks',
            'In-office for collaboration',
          ],
          conclusion: 'Hybrid model is optimal',
          argumentType: 'synthesis' as const,
          confidence: 0.9,
          respondsTo: 'arg-antithesis',
          nextArgumentNeeded: false,
        });
        expect(parseResult(synthesis).status).toBe('success');

        // Verify all arguments stored in the chain
        const history = server.getDebateHistory('arg-thesis');
        expect(history).toHaveLength(3);
        expect(history[0].argumentId).toBe('arg-thesis');
        expect(history[0].argumentType).toBe('thesis');
        expect(history[1].argumentId).toBe('arg-antithesis');
        expect(history[1].argumentType).toBe('antithesis');
        expect(history[2].argumentId).toBe('arg-synthesis');
        expect(history[2].argumentType).toBe('synthesis');
      });

      it('should maintain separate state for different debate chains', () => {
        // Chain 1: Remote work debate
        server.processStructuredArgumentation({
          argumentId: 'remote-thesis',
          claim: 'Remote work improves productivity',
          premises: ['Fewer interruptions'],
          conclusion: 'Embrace remote work',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });

        // Chain 2: AI ethics debate
        server.processStructuredArgumentation({
          argumentId: 'ai-thesis',
          claim: 'AI development needs regulation',
          premises: ['Potential for misuse'],
          conclusion: 'Regulate AI development',
          argumentType: 'thesis' as const,
          confidence: 0.85,
          nextArgumentNeeded: true,
        });

        // Verify separate chains
        const remoteHistory = server.getDebateHistory('remote-thesis');
        const aiHistory = server.getDebateHistory('ai-thesis');

        expect(remoteHistory).toHaveLength(1);
        expect(aiHistory).toHaveLength(1);
        expect(remoteHistory[0].claim).toBe('Remote work improves productivity');
        expect(aiHistory[0].claim).toBe('AI development needs regulation');
      });

      it('should return empty array for non-existent debate chain', () => {
        const history = server.getDebateHistory('non-existent-chain');
        expect(history).toEqual([]);
      });
    });

    describe('Argument Relationships', () => {
      it('should track respondsTo relationships', () => {
        server.processStructuredArgumentation({
          argumentId: 'arg-1',
          claim: 'Original claim',
          premises: ['Premise 1'],
          conclusion: 'Conclusion 1',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'arg-2',
          claim: 'Response claim',
          premises: ['Premise 2'],
          conclusion: 'Conclusion 2',
          argumentType: 'objection' as const,
          confidence: 0.7,
          respondsTo: 'arg-1',
          nextArgumentNeeded: true,
        });

        const history = server.getDebateHistory('arg-1');
        expect(history).toHaveLength(2);
        expect(history[1].respondsTo).toBe('arg-1');
      });

      it('should track supports relationships', () => {
        server.processStructuredArgumentation({
          argumentId: 'arg-main',
          claim: 'Main argument',
          premises: ['Main premise'],
          conclusion: 'Main conclusion',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'arg-support',
          claim: 'Supporting argument',
          premises: ['Supporting premise'],
          conclusion: 'Supporting conclusion',
          argumentType: 'thesis' as const,
          confidence: 0.75,
          respondsTo: 'arg-main',
          supports: ['arg-main'],
          nextArgumentNeeded: false,
        });

        const history = server.getDebateHistory('arg-main');
        expect(history).toHaveLength(2);
        expect(history[1].supports).toContain('arg-main');
      });

      it('should track contradicts relationships', () => {
        server.processStructuredArgumentation({
          argumentId: 'arg-original',
          claim: 'Original position',
          premises: ['Original premise'],
          conclusion: 'Original conclusion',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'arg-counter',
          claim: 'Counter position',
          premises: ['Counter premise'],
          conclusion: 'Counter conclusion',
          argumentType: 'antithesis' as const,
          confidence: 0.75,
          respondsTo: 'arg-original',
          contradicts: ['arg-original'],
          nextArgumentNeeded: false,
        });

        const history = server.getDebateHistory('arg-original');
        expect(history).toHaveLength(2);
        expect(history[1].contradicts).toContain('arg-original');
      });
    });

    describe('getArgumentTree', () => {
      it('should build tree structure with argument relationships', () => {
        // Create a debate tree
        server.processStructuredArgumentation({
          argumentId: 'root',
          claim: 'Climate action is urgent',
          premises: ['Rising temperatures', 'Extreme weather events'],
          conclusion: 'We must act now on climate',
          argumentType: 'thesis' as const,
          confidence: 0.9,
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'obj-1',
          claim: 'Economic costs are too high',
          premises: ['Transition costs', 'Job losses'],
          conclusion: 'Climate action is not affordable',
          argumentType: 'objection' as const,
          confidence: 0.6,
          respondsTo: 'root',
          contradicts: ['root'],
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'reb-1',
          claim: 'Inaction costs more',
          premises: ['Disaster costs', 'Health impacts'],
          conclusion: 'We cannot afford inaction',
          argumentType: 'rebuttal' as const,
          confidence: 0.85,
          respondsTo: 'obj-1',
          nextArgumentNeeded: false,
        });

        const tree = server.getArgumentTree('root');

        expect(tree.rootArgumentId).toBe('root');
        expect(tree.totalArguments).toBe(3);
        expect(tree.argumentTypes).toEqual(['thesis', 'objection', 'rebuttal']);
        expect(tree.tree).toHaveLength(3);

        // Verify root node has objection as child
        const rootNode = tree.tree.find(n => n.argumentId === 'root');
        expect(rootNode).toBeDefined();
        expect(rootNode?.children).toHaveLength(1);
        expect(rootNode?.children[0].argumentId).toBe('obj-1');
        expect(rootNode?.children[0].relationshipType).toBe('response');

        // Verify objection node has rebuttal as child
        const objNode = tree.tree.find(n => n.argumentId === 'obj-1');
        expect(objNode).toBeDefined();
        expect(objNode?.children).toHaveLength(1);
        expect(objNode?.children[0].argumentId).toBe('reb-1');
        expect(objNode?.children[0].relationshipType).toBe('response');
      });

      it('should handle support and contradiction relationships in tree', () => {
        server.processStructuredArgumentation({
          argumentId: 'main',
          claim: 'Technology improves education',
          premises: ['Access to information', 'Interactive learning'],
          conclusion: 'Schools should adopt more technology',
          argumentType: 'thesis' as const,
          confidence: 0.8,
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'support',
          claim: 'Students engage more with tech',
          premises: ['Higher participation'],
          conclusion: 'Tech enhances engagement',
          argumentType: 'thesis' as const,
          confidence: 0.75,
          respondsTo: 'main',
          supports: ['main'],
          nextArgumentNeeded: true,
        });

        server.processStructuredArgumentation({
          argumentId: 'contra',
          claim: 'Tech can be distracting',
          premises: ['Off-task behavior'],
          conclusion: 'Tech has downsides',
          argumentType: 'antithesis' as const,
          confidence: 0.7,
          respondsTo: 'main',
          contradicts: ['main'],
          nextArgumentNeeded: false,
        });

        const tree = server.getArgumentTree('main');

        const mainNode = tree.tree.find(n => n.argumentId === 'main');
        expect(mainNode?.children).toHaveLength(2);

        const supportChild = mainNode?.children.find(c => c.argumentId === 'support');
        expect(supportChild?.relationshipType).toBe('response');

        const contraChild = mainNode?.children.find(c => c.argumentId === 'contra');
        expect(contraChild?.relationshipType).toBe('response');
      });

      it('should return empty tree for non-existent debate', () => {
        const tree = server.getArgumentTree('non-existent');

        expect(tree.rootArgumentId).toBe('non-existent');
        expect(tree.totalArguments).toBe(0);
        expect(tree.argumentTypes).toEqual([]);
        expect(tree.tree).toEqual([]);
      });
    });

    describe('Data Preservation', () => {
      it('should preserve all argument data in history', () => {
        const fullArgument = {
          argumentId: 'full-arg',
          claim: 'Comprehensive claim',
          premises: ['Premise 1', 'Premise 2', 'Premise 3'],
          conclusion: 'Detailed conclusion',
          argumentType: 'thesis' as const,
          confidence: 0.85,
          supports: ['other-arg-1'],
          contradicts: ['other-arg-2'],
          strengths: ['Strong evidence', 'Logical consistency'],
          weaknesses: ['Limited scope', 'Some assumptions'],
          nextArgumentNeeded: true,
          suggestedNextTypes: ['antithesis' as const, 'objection' as const],
        };

        server.processStructuredArgumentation(fullArgument);

        const history = server.getDebateHistory('full-arg');
        expect(history).toHaveLength(1);

        const stored = history[0];
        expect(stored.argumentId).toBe('full-arg');
        expect(stored.claim).toBe('Comprehensive claim');
        expect(stored.premises).toEqual(['Premise 1', 'Premise 2', 'Premise 3']);
        expect(stored.conclusion).toBe('Detailed conclusion');
        expect(stored.argumentType).toBe('thesis');
        expect(stored.confidence).toBe(0.85);
        expect(stored.supports).toEqual(['other-arg-1']);
        expect(stored.contradicts).toEqual(['other-arg-2']);
        expect(stored.strengths).toEqual(['Strong evidence', 'Logical consistency']);
        expect(stored.weaknesses).toEqual(['Limited scope', 'Some assumptions']);
        expect(stored.nextArgumentNeeded).toBe(true);
        expect(stored.suggestedNextTypes).toEqual(['antithesis', 'objection']);
      });
    });
  });
});
