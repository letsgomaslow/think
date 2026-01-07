import { describe, it, expect, beforeEach } from 'vitest';
import { ParadigmServer } from './paradigmServer.js';

describe('ParadigmServer', () => {
  let server: ParadigmServer;

  beforeEach(() => {
    server = new ParadigmServer();
  });

  it('should process valid paradigm data', () => {
    const result = server.processParadigm({
      paradigmName: 'functional',
      problem: 'Data transformation pipeline',
      approach: ['Use pure functions', 'Avoid side effects'],
      benefits: ['Testability', 'Predictability'],
      limitations: ['Learning curve', 'Performance in some cases'],
    });

    expect(result.status).toBe('success');
    expect(result.data?.paradigmName).toBe('functional');
    expect(result.data?.hasApproach).toBe(true);
  });

  it('should return failed status for missing paradigmName', () => {
    const result = server.processParadigm({
      problem: 'test problem',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for missing problem', () => {
    const result = server.processParadigm({
      paradigmName: 'functional',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle optional fields', () => {
    const result = server.processParadigm({
      paradigmName: 'object_oriented',
      problem: 'Modeling business entities',
    });

    expect(result.status).toBe('success');
    expect(result.data?.paradigmName).toBe('object_oriented');
    expect(result.data?.hasApproach).toBe(false);
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
      expect(result.status).toBe('success');
      expect(result.data?.paradigmName).toBe(paradigmName);
    });
  });
});
