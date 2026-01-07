import { describe, it, expect, beforeEach } from 'vitest';
import { PatternServer } from './patternServer.js';

describe('PatternServer', () => {
  let server: PatternServer;

  beforeEach(() => {
    server = new PatternServer();
  });

  it('should process valid design pattern data', () => {
    const result = server.processPattern({
      patternName: 'modular_architecture',
      context: 'Building a microservices system',
      implementation: ['Define service boundaries', 'Create API contracts'],
      benefits: ['Scalability', 'Independent deployment'],
      tradeoffs: ['Increased complexity', 'Network latency'],
    });

    expect(result.status).toBe('success');
    expect(result.data?.patternName).toBe('modular_architecture');
    expect(result.data?.hasImplementation).toBe(true);
  });

  it('should return failed status for missing patternName', () => {
    const result = server.processPattern({
      context: 'test context',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for missing context', () => {
    const result = server.processPattern({
      patternName: 'modular_architecture',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle optional fields', () => {
    const result = server.processPattern({
      patternName: 'api_integration',
      context: 'Integrating external APIs',
    });

    expect(result.status).toBe('success');
    expect(result.data?.patternName).toBe('api_integration');
    expect(result.data?.hasImplementation).toBe(false);
  });

  it('should handle code examples', () => {
    const result = server.processPattern({
      patternName: 'state_management',
      context: 'Managing React state',
      codeExample: 'const [state, setState] = useState()',
      languages: ['typescript', 'javascript'],
    });

    expect(result.status).toBe('success');
    expect(result.data?.hasCodeExample).toBe(true);
  });
});
