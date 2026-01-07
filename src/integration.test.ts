import { describe, it, expect } from 'vitest';
import { TOOL_NAMES } from './toolNames.js';

// Import all servers to verify they load correctly
import { TraceServer } from './tools/traceServer.js';
import { ModelServer } from './tools/modelServer.js';
import { PatternServer } from './tools/patternServer.js';
import { ParadigmServer } from './tools/paradigmServer.js';
import { DebugServer } from './tools/debugServer.js';
import { CouncilServer } from './tools/councilServer.js';
import { DecideServer } from './tools/decideServer.js';
import { ReflectServer } from './tools/reflectServer.js';
import { HypothesisServer } from './tools/hypothesisServer.js';
import { DebateServer } from './tools/debateServer.js';
import { MapServer } from './tools/mapServer.js';

describe('think-mcp Integration', () => {
  describe('Tool Names', () => {
    it('should have exactly 11 tool names', () => {
      const toolNames = Object.values(TOOL_NAMES);
      expect(toolNames).toHaveLength(11);
    });

    it('should have all expected tool names', () => {
      expect(TOOL_NAMES.TRACE).toBe('trace');
      expect(TOOL_NAMES.MODEL).toBe('model');
      expect(TOOL_NAMES.PATTERN).toBe('pattern');
      expect(TOOL_NAMES.PARADIGM).toBe('paradigm');
      expect(TOOL_NAMES.DEBUG).toBe('debug');
      expect(TOOL_NAMES.COUNCIL).toBe('council');
      expect(TOOL_NAMES.DECIDE).toBe('decide');
      expect(TOOL_NAMES.REFLECT).toBe('reflect');
      expect(TOOL_NAMES.HYPOTHESIS).toBe('hypothesis');
      expect(TOOL_NAMES.DEBATE).toBe('debate');
      expect(TOOL_NAMES.MAP).toBe('map');
    });

    it('should have short tool names (max 10 chars)', () => {
      Object.values(TOOL_NAMES).forEach(name => {
        expect(name.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Server Instantiation', () => {
    it('should instantiate TraceServer', () => {
      const server = new TraceServer();
      expect(server).toBeDefined();
      expect(typeof server.processThought).toBe('function');
    });

    it('should instantiate ModelServer', () => {
      const server = new ModelServer();
      expect(server).toBeDefined();
      expect(typeof server.processModel).toBe('function');
    });

    it('should instantiate PatternServer', () => {
      const server = new PatternServer();
      expect(server).toBeDefined();
      expect(typeof server.processPattern).toBe('function');
    });

    it('should instantiate ParadigmServer', () => {
      const server = new ParadigmServer();
      expect(server).toBeDefined();
      expect(typeof server.processParadigm).toBe('function');
    });

    it('should instantiate DebugServer', () => {
      const server = new DebugServer();
      expect(server).toBeDefined();
      expect(typeof server.processApproach).toBe('function');
    });

    it('should instantiate CouncilServer', () => {
      const server = new CouncilServer();
      expect(server).toBeDefined();
      expect(typeof server.processCollaborativeReasoning).toBe('function');
    });

    it('should instantiate DecideServer', () => {
      const server = new DecideServer();
      expect(server).toBeDefined();
      expect(typeof server.processDecisionFramework).toBe('function');
    });

    it('should instantiate ReflectServer', () => {
      const server = new ReflectServer();
      expect(server).toBeDefined();
      expect(typeof server.processMetacognitiveMonitoring).toBe('function');
    });

    it('should instantiate HypothesisServer', () => {
      const server = new HypothesisServer();
      expect(server).toBeDefined();
      expect(typeof server.processScientificMethod).toBe('function');
    });

    it('should instantiate DebateServer', () => {
      const server = new DebateServer();
      expect(server).toBeDefined();
      expect(typeof server.processStructuredArgumentation).toBe('function');
    });

    it('should instantiate MapServer', () => {
      const server = new MapServer();
      expect(server).toBeDefined();
      expect(typeof server.processVisualReasoning).toBe('function');
    });
  });

  describe('Error Handling', () => {
    // All servers now return ServerResponse<T> with status: 'failed' on invalid input
    it('should return error for invalid TraceServer input', () => {
      const server = new TraceServer();
      const result = server.processThought({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid CouncilServer input', () => {
      const server = new CouncilServer();
      const result = server.processCollaborativeReasoning({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid DecideServer input', () => {
      const server = new DecideServer();
      const result = server.processDecisionFramework({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid ModelServer input', () => {
      const server = new ModelServer();
      const result = server.processModel({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid PatternServer input', () => {
      const server = new PatternServer();
      const result = server.processPattern({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid ParadigmServer input', () => {
      const server = new ParadigmServer();
      const result = server.processParadigm({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid DebugServer input', () => {
      const server = new DebugServer();
      const result = server.processApproach({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid ReflectServer input', () => {
      const server = new ReflectServer();
      const result = server.processMetacognitiveMonitoring({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid HypothesisServer input', () => {
      const server = new HypothesisServer();
      const result = server.processScientificMethod({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid DebateServer input', () => {
      const server = new DebateServer();
      const result = server.processStructuredArgumentation({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid MapServer input', () => {
      const server = new MapServer();
      const result = server.processVisualReasoning({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });
  });
});
