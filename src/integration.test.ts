import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TOOL_NAMES } from './toolNames.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
import { FeedbackServer } from './tools/feedbackServer.js';

describe('think-mcp Integration', () => {
  describe('Tool Names', () => {
    it('should have exactly 12 tool names', () => {
      const toolNames = Object.values(TOOL_NAMES);
      expect(toolNames).toHaveLength(12);
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
      expect(TOOL_NAMES.FEEDBACK).toBe('feedback');
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

    it('should instantiate FeedbackServer', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-integration-"));
      try {
        const server = new FeedbackServer(tempDir);
        expect(server).toBeDefined();
        expect(typeof server.processFeedback).toBe('function');
        expect(typeof server.getAllFeedback).toBe('function');
        expect(typeof server.getFeedbackByTool).toBe('function');
        expect(typeof server.getFeedbackSummary).toBe('function');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Error Handling', () => {
    // Servers that throw on invalid input
    it('should throw on invalid input for TraceServer', () => {
      const server = new TraceServer();
      expect(() => server.processThought({})).toThrow();
    });

    it('should throw on invalid input for CouncilServer', () => {
      const server = new CouncilServer();
      expect(() => server.processCollaborativeReasoning({})).toThrow();
    });

    it('should throw on invalid input for DecideServer', () => {
      const server = new DecideServer();
      expect(() => server.processDecisionFramework({})).toThrow();
    });

    // Servers that return error objects instead of throwing
    it('should return error for invalid ModelServer input', () => {
      const server = new ModelServer();
      const result = server.processModel({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid PatternServer input', () => {
      const server = new PatternServer();
      const result = server.processPattern({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid ParadigmServer input', () => {
      const server = new ParadigmServer();
      const result = server.processParadigm({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid DebugServer input', () => {
      const server = new DebugServer();
      const result = server.processApproach({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid ReflectServer input', () => {
      const server = new ReflectServer();
      const result = server.processMetacognitiveMonitoring({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid HypothesisServer input', () => {
      const server = new HypothesisServer();
      const result = server.processScientificMethod({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid DebateServer input', () => {
      const server = new DebateServer();
      const result = server.processStructuredArgumentation({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid MapServer input', () => {
      const server = new MapServer();
      const result = server.processVisualReasoning({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid FeedbackServer input', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-error-"));
      try {
        const server = new FeedbackServer(tempDir);
        const result = server.processFeedback({});
        expect(result.status).toBe('failed');
        expect(result.error).toBeDefined();
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  // ============================================================================
  // Feedback Flow Integration Tests
  // ============================================================================
  describe('Feedback Flow Integration', () => {
    let tempDir: string;
    let feedbackServer: FeedbackServer;

    beforeEach(() => {
      // Create isolated temp directory for each test
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-flow-"));
      feedbackServer = new FeedbackServer(tempDir);
    });

    afterEach(() => {
      // Clean up temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    describe('Feedback Tool MCP Call Simulation', () => {
      it('should process feedback tool call as it would via MCP', () => {
        // Simulate the MCP tool call pattern from index.ts
        const mcpArgs = {
          rating: 'thumbs-up',
          toolName: 'trace',
          comment: 'Great tool for step-by-step thinking!',
          invocationId: 'test-invocation-001',
        };

        // This mirrors how index.ts calls the server
        const result = feedbackServer.processFeedback(mcpArgs);

        // Verify MCP-compatible response structure
        expect(result.status).toBe('success');
        expect(result.id).toBeDefined();
        expect(result.rating).toBe('thumbs-up');
        expect(result.toolName).toBe('trace');
        expect(result.invocationId).toBe('test-invocation-001');
        expect(result.message).toBe('Thank you for your feedback!');
        expect(result.hasComment).toBe(true);
        expect(result.timestamp).toBeDefined();
      });

      it('should handle all rating types via MCP call pattern', () => {
        const ratingTypes = ['thumbs-up', 'thumbs-down', 'issue-report'] as const;

        ratingTypes.forEach(rating => {
          const result = feedbackServer.processFeedback({
            rating,
            toolName: 'test-tool',
          });
          expect(result.status).toBe('success');
          expect(result.rating).toBe(rating);
        });

        // All ratings should be stored
        const allFeedback = feedbackServer.getAllFeedback();
        expect(allFeedback).toHaveLength(3);
      });
    });

    describe('Feedback Storage and Retrieval', () => {
      it('should persist feedback and retrieve via getAllFeedback', () => {
        // Submit multiple feedback entries
        const feedbackInputs = [
          { rating: 'thumbs-up', toolName: 'trace', comment: 'Helpful!' },
          { rating: 'thumbs-down', toolName: 'model', comment: 'Could be better' },
          { rating: 'issue-report', toolName: 'debug', comment: 'Found a bug' },
        ];

        feedbackInputs.forEach(input => {
          const result = feedbackServer.processFeedback(input);
          expect(result.status).toBe('success');
        });

        // Verify all entries are stored
        const allFeedback = feedbackServer.getAllFeedback();
        expect(allFeedback).toHaveLength(3);

        // Verify data integrity
        const traceEntry = allFeedback.find(e => e.toolName === 'trace');
        expect(traceEntry).toBeDefined();
        expect(traceEntry!.rating).toBe('thumbs-up');
        expect(traceEntry!.comment).toBe('Helpful!');
      });

      it('should filter feedback by tool name via getFeedbackByTool', () => {
        // Submit feedback for multiple tools
        feedbackServer.processFeedback({ rating: 'thumbs-up', toolName: 'trace' });
        feedbackServer.processFeedback({ rating: 'thumbs-up', toolName: 'trace' });
        feedbackServer.processFeedback({ rating: 'thumbs-down', toolName: 'model' });
        feedbackServer.processFeedback({ rating: 'issue-report', toolName: 'debug' });

        // Filter by tool
        const traceFeedback = feedbackServer.getFeedbackByTool('trace');
        expect(traceFeedback).toHaveLength(2);
        traceFeedback.forEach(entry => {
          expect(entry.toolName).toBe('trace');
        });

        const modelFeedback = feedbackServer.getFeedbackByTool('model');
        expect(modelFeedback).toHaveLength(1);
        expect(modelFeedback[0].rating).toBe('thumbs-down');

        // Non-existent tool returns empty array
        const nonExistent = feedbackServer.getFeedbackByTool('nonexistent');
        expect(nonExistent).toEqual([]);
      });

      it('should calculate summary statistics via getFeedbackSummary', () => {
        // Submit mixed feedback
        feedbackServer.processFeedback({ rating: 'thumbs-up', toolName: 'trace' });
        feedbackServer.processFeedback({ rating: 'thumbs-up', toolName: 'trace' });
        feedbackServer.processFeedback({ rating: 'thumbs-up', toolName: 'model' });
        feedbackServer.processFeedback({ rating: 'thumbs-down', toolName: 'trace' });
        feedbackServer.processFeedback({ rating: 'issue-report', toolName: 'debug' });

        const summary = feedbackServer.getFeedbackSummary();

        // Verify totals
        expect(summary.total).toBe(5);
        expect(summary.byRating['thumbs-up']).toBe(3);
        expect(summary.byRating['thumbs-down']).toBe(1);
        expect(summary.byRating['issue-report']).toBe(1);

        // Verify per-tool breakdown
        expect(summary.byTool['trace']).toBe(3);
        expect(summary.byTool['model']).toBe(1);
        expect(summary.byTool['debug']).toBe(1);
      });
    });

    describe('Feedback Data Persistence to File', () => {
      it('should persist feedback to JSON file', () => {
        feedbackServer.processFeedback({
          rating: 'thumbs-up',
          toolName: 'trace',
          comment: 'Test persistence',
        });

        // Verify file exists and contains valid JSON
        const storagePath = feedbackServer.getStoragePath();
        expect(fs.existsSync(storagePath)).toBe(true);

        const fileContent = fs.readFileSync(storagePath, 'utf-8');
        const entries = JSON.parse(fileContent);
        expect(Array.isArray(entries)).toBe(true);
        expect(entries).toHaveLength(1);
        expect(entries[0].rating).toBe('thumbs-up');
        expect(entries[0].toolName).toBe('trace');
        expect(entries[0].comment).toBe('Test persistence');
      });

      it('should survive server restart (read persisted data)', () => {
        // Submit feedback with first server instance
        feedbackServer.processFeedback({
          rating: 'thumbs-up',
          toolName: 'trace',
          comment: 'Before restart',
        });

        // Create new server instance pointing to same directory
        const newServer = new FeedbackServer(tempDir);

        // Should be able to read previously stored data
        const allFeedback = newServer.getAllFeedback();
        expect(allFeedback).toHaveLength(1);
        expect(allFeedback[0].comment).toBe('Before restart');

        // Should be able to add new feedback
        newServer.processFeedback({
          rating: 'thumbs-down',
          toolName: 'model',
          comment: 'After restart',
        });

        const updatedFeedback = newServer.getAllFeedback();
        expect(updatedFeedback).toHaveLength(2);
      });

      it('should store feedback in format compatible with API endpoints', () => {
        // Submit feedback
        feedbackServer.processFeedback({
          rating: 'issue-report',
          toolName: 'debug',
          comment: 'Error in output',
          invocationId: 'inv-123',
        });

        // Read the raw JSON file (as the API route would)
        const storagePath = feedbackServer.getStoragePath();
        const fileContent = fs.readFileSync(storagePath, 'utf-8');
        const entries = JSON.parse(fileContent);

        // Verify the stored format matches what API expects
        expect(entries[0]).toHaveProperty('id');
        expect(entries[0]).toHaveProperty('rating');
        expect(entries[0]).toHaveProperty('toolName');
        expect(entries[0]).toHaveProperty('timestamp');
        expect(entries[0]).toHaveProperty('invocationId');
        expect(entries[0]).toHaveProperty('comment');

        // Verify types are correct
        expect(typeof entries[0].id).toBe('string');
        expect(typeof entries[0].timestamp).toBe('string');
        expect(entries[0].rating).toBe('issue-report');

        // Verify timestamp is valid ISO format
        const timestamp = new Date(entries[0].timestamp);
        expect(timestamp.toISOString()).toBe(entries[0].timestamp);
      });
    });

    describe('Full Feedback Submission Flow', () => {
      it('should complete full flow: submit -> store -> retrieve -> summarize', () => {
        // Step 1: Submit feedback (as would happen via MCP tool call)
        const submitResult = feedbackServer.processFeedback({
          rating: 'thumbs-up',
          toolName: 'council',
          comment: 'Multiple perspectives were very helpful!',
          invocationId: 'council-session-001',
        });
        expect(submitResult.status).toBe('success');
        const feedbackId = submitResult.id;

        // Step 2: Verify storage (as API would retrieve)
        const allFeedback = feedbackServer.getAllFeedback();
        const storedEntry = allFeedback.find(e => e.id === feedbackId);
        expect(storedEntry).toBeDefined();
        expect(storedEntry!.rating).toBe('thumbs-up');
        expect(storedEntry!.toolName).toBe('council');
        expect(storedEntry!.invocationId).toBe('council-session-001');

        // Step 3: Verify tool-specific retrieval (as dashboard would filter)
        const councilFeedback = feedbackServer.getFeedbackByTool('council');
        expect(councilFeedback).toHaveLength(1);
        expect(councilFeedback[0].id).toBe(feedbackId);

        // Step 4: Verify summary statistics (as dashboard summary would show)
        const summary = feedbackServer.getFeedbackSummary();
        expect(summary.total).toBe(1);
        expect(summary.byRating['thumbs-up']).toBe(1);
        expect(summary.byTool['council']).toBe(1);
      });

      it('should handle multiple users/sessions submitting feedback', () => {
        // Simulate multiple feedback submissions from different tool invocations
        const submissions = [
          { rating: 'thumbs-up', toolName: 'trace', invocationId: 'user1-trace-001' },
          { rating: 'thumbs-up', toolName: 'trace', invocationId: 'user2-trace-001' },
          { rating: 'thumbs-down', toolName: 'model', invocationId: 'user1-model-001' },
          { rating: 'issue-report', toolName: 'debug', invocationId: 'user3-debug-001', comment: 'Found issue' },
          { rating: 'thumbs-up', toolName: 'council', invocationId: 'user2-council-001' },
        ];

        submissions.forEach(input => {
          const result = feedbackServer.processFeedback(input);
          expect(result.status).toBe('success');
        });

        // Verify all submissions are stored with unique IDs
        const allFeedback = feedbackServer.getAllFeedback();
        expect(allFeedback).toHaveLength(5);

        const uniqueIds = new Set(allFeedback.map(e => e.id));
        expect(uniqueIds.size).toBe(5); // All IDs should be unique

        // Verify invocation IDs are preserved
        const invocationIds = allFeedback.map(e => e.invocationId);
        expect(invocationIds).toContain('user1-trace-001');
        expect(invocationIds).toContain('user3-debug-001');

        // Verify summary reflects all submissions
        const summary = feedbackServer.getFeedbackSummary();
        expect(summary.total).toBe(5);
        expect(summary.byRating['thumbs-up']).toBe(3);
        expect(summary.byRating['thumbs-down']).toBe(1);
        expect(summary.byRating['issue-report']).toBe(1);
      });

      it('should maintain data integrity across tool and rating combinations', () => {
        // Submit feedback for all tool names with different ratings
        const toolNames = ['trace', 'model', 'pattern', 'paradigm', 'debug', 'council', 'decide', 'reflect'];
        const ratings = ['thumbs-up', 'thumbs-down', 'issue-report'] as const;

        toolNames.forEach((toolName, i) => {
          feedbackServer.processFeedback({
            rating: ratings[i % 3],
            toolName,
            comment: `Feedback for ${toolName}`,
          });
        });

        // Verify each tool has exactly one feedback
        toolNames.forEach(toolName => {
          const toolFeedback = feedbackServer.getFeedbackByTool(toolName);
          expect(toolFeedback).toHaveLength(1);
          expect(toolFeedback[0].toolName).toBe(toolName);
        });

        // Verify summary totals
        const summary = feedbackServer.getFeedbackSummary();
        expect(summary.total).toBe(toolNames.length);
        expect(Object.keys(summary.byTool)).toHaveLength(toolNames.length);
      });
    });
  });
});
