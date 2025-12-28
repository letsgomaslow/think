import { describe, it, expect, beforeEach } from 'vitest';
import { PatternServer } from './patternServer.js';

describe('PatternServer', () => {
  let server: PatternServer;

  beforeEach(() => {
    server = new PatternServer();
  });

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid design pattern data', () => {
    const result = server.processPattern({
      patternName: 'modular_architecture',
      context: 'Building a microservices system',
      implementation: ['Define service boundaries', 'Create API contracts'],
      benefits: ['Scalability', 'Independent deployment'],
      tradeoffs: ['Increased complexity', 'Network latency'],
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.patternName).toBe('modular_architecture');
    expect(parsed.hasImplementation).toBe(true);
  });

  it('should return failed status for missing patternName', () => {
    const result = server.processPattern({
      context: 'test context',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for missing context', () => {
    const result = server.processPattern({
      patternName: 'modular_architecture',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle optional fields', () => {
    const result = server.processPattern({
      patternName: 'api_integration',
      context: 'Integrating external APIs',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.patternName).toBe('api_integration');
    expect(parsed.hasImplementation).toBe(false);
  });

  it('should handle code examples', () => {
    const result = server.processPattern({
      patternName: 'state_management',
      context: 'Managing React state',
      codeExample: 'const [state, setState] = useState()',
      languages: ['typescript', 'javascript'],
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.hasCodeExample).toBe(true);
  });
});
