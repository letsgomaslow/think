import { describe, it, expect, beforeEach } from 'vitest';
import { ParadigmServer } from './paradigmServer.js';

describe('ParadigmServer', () => {
  let server: ParadigmServer;

  beforeEach(() => {
    server = new ParadigmServer();
  });

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid paradigm data', () => {
    const result = server.processParadigm({
      paradigmName: 'functional',
      problem: 'Data transformation pipeline',
      approach: ['Use pure functions', 'Avoid side effects'],
      benefits: ['Testability', 'Predictability'],
      limitations: ['Learning curve', 'Performance in some cases'],
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.paradigmName).toBe('functional');
    expect(parsed.hasApproach).toBe(true);
  });

  it('should return failed status for missing paradigmName', () => {
    const result = server.processParadigm({
      problem: 'test problem',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for missing problem', () => {
    const result = server.processParadigm({
      paradigmName: 'functional',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle optional fields', () => {
    const result = server.processParadigm({
      paradigmName: 'object_oriented',
      problem: 'Modeling business entities',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.paradigmName).toBe('object_oriented');
    expect(parsed.hasApproach).toBe(false);
  });

  it('should process all paradigm types', () => {
    const paradigms = [
      'imperative',
      'procedural',
      'object_oriented',
      'functional',
      'declarative',
      'logic',
      'event_driven',
      'aspect_oriented',
      'concurrent',
      'reactive',
    ];

    paradigms.forEach(paradigmName => {
      const result = server.processParadigm({
        paradigmName,
        problem: 'Test problem',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.paradigmName).toBe(paradigmName);
    });
  });
});
