import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FeedbackServer } from "./feedbackServer.js";
import fs from "fs";
import path from "path";
import os from "os";

describe("FeedbackServer", () => {
    let server: FeedbackServer;
    let tempDir: string;

    beforeEach(() => {
        // Create a unique temp directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-test-"));
        server = new FeedbackServer(tempDir);
    });

    afterEach(() => {
        // Clean up temp directory after each test
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    describe("processFeedback", () => {
        it("should process thumbs-up rating submission", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });

            expect(result.status).toBe("success");
            expect(result.rating).toBe("thumbs-up");
            expect(result.toolName).toBe("trace");
            expect(result.message).toBe("Thank you for your feedback!");
            expect(result.id).toBeDefined();
            expect(result.timestamp).toBeDefined();
            expect(result.invocationId).toBeDefined();
            expect(result.hasComment).toBe(false);
        });

        it("should process thumbs-down rating submission", () => {
            const result = server.processFeedback({
                rating: "thumbs-down",
                toolName: "model",
            });

            expect(result.status).toBe("success");
            expect(result.rating).toBe("thumbs-down");
            expect(result.toolName).toBe("model");
            expect(result.hasComment).toBe(false);
        });

        it("should process issue-report rating submission", () => {
            const result = server.processFeedback({
                rating: "issue-report",
                toolName: "debug",
                comment: "The tool crashed with an unexpected error",
            });

            expect(result.status).toBe("success");
            expect(result.rating).toBe("issue-report");
            expect(result.toolName).toBe("debug");
            expect(result.hasComment).toBe(true);
        });

        it("should process optional text comment", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "pattern",
                comment: "Great explanation of the factory pattern!",
            });

            expect(result.status).toBe("success");
            expect(result.hasComment).toBe(true);
        });

        it("should handle optional invocationId", () => {
            const customInvocationId = "test-invocation-123";
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "council",
                invocationId: customInvocationId,
            });

            expect(result.status).toBe("success");
            expect(result.invocationId).toBe(customInvocationId);
        });

        it("should generate invocationId when not provided", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "decide",
            });

            expect(result.status).toBe("success");
            expect(result.invocationId).toBeDefined();
            expect(result.invocationId.length).toBeGreaterThan(0);
        });
    });

    describe("input validation", () => {
        it("should return failed status for missing rating", () => {
            const result = server.processFeedback({
                toolName: "trace",
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid rating");
        });

        it("should return failed status for missing toolName", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid toolName");
        });

        it("should return failed status for invalid rating value", () => {
            const result = server.processFeedback({
                rating: "invalid-rating",
                toolName: "trace",
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid rating");
            expect(result.error).toContain("thumbs-up");
            expect(result.error).toContain("thumbs-down");
            expect(result.error).toContain("issue-report");
        });

        it("should return failed status for non-string rating", () => {
            const result = server.processFeedback({
                rating: 123,
                toolName: "trace",
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid rating");
        });

        it("should return failed status for non-string toolName", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: 456,
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid toolName");
        });

        it("should return failed status for non-string comment", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                comment: { invalid: "object" },
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid comment");
        });

        it("should return failed status for non-string invocationId", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                invocationId: 789,
            });

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
            expect(result.error).toContain("Invalid invocationId");
        });

        it("should return failed status for null input", () => {
            const result = server.processFeedback(null);

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
        });

        it("should return failed status for undefined input", () => {
            const result = server.processFeedback(undefined);

            expect(result.status).toBe("failed");
            expect(result.error).toBeDefined();
        });
    });

    describe("feedback storage and retrieval", () => {
        it("should store feedback and retrieve it with getAllFeedback", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });

            const allFeedback = server.getAllFeedback();

            expect(allFeedback).toHaveLength(1);
            expect(allFeedback[0].rating).toBe("thumbs-up");
            expect(allFeedback[0].toolName).toBe("trace");
        });

        it("should store multiple feedback entries", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-down",
                toolName: "model",
            });
            server.processFeedback({
                rating: "issue-report",
                toolName: "debug",
                comment: "Found a bug",
            });

            const allFeedback = server.getAllFeedback();

            expect(allFeedback).toHaveLength(3);
        });

        it("should persist feedback entries with unique IDs", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });

            const allFeedback = server.getAllFeedback();

            expect(allFeedback).toHaveLength(2);
            expect(allFeedback[0].id).not.toBe(allFeedback[1].id);
        });

        it("should persist feedback to file", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });

            const storagePath = server.getStoragePath();
            expect(fs.existsSync(storagePath)).toBe(true);

            const fileContent = fs.readFileSync(storagePath, "utf-8");
            const entries = JSON.parse(fileContent);
            expect(entries).toHaveLength(1);
            expect(entries[0].rating).toBe("thumbs-up");
        });

        it("should retrieve empty array when no feedback exists", () => {
            const allFeedback = server.getAllFeedback();
            expect(allFeedback).toEqual([]);
        });
    });

    describe("getFeedbackByTool", () => {
        beforeEach(() => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-down",
                toolName: "model",
            });
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                comment: "Great tool!",
            });
            server.processFeedback({
                rating: "issue-report",
                toolName: "debug",
            });
        });

        it("should retrieve feedback for specific tool", () => {
            const traceFeedback = server.getFeedbackByTool("trace");

            expect(traceFeedback).toHaveLength(2);
            traceFeedback.forEach((entry) => {
                expect(entry.toolName).toBe("trace");
            });
        });

        it("should return empty array for tool with no feedback", () => {
            const nonExistentFeedback = server.getFeedbackByTool("nonexistent");

            expect(nonExistentFeedback).toEqual([]);
        });

        it("should filter correctly with single match", () => {
            const modelFeedback = server.getFeedbackByTool("model");

            expect(modelFeedback).toHaveLength(1);
            expect(modelFeedback[0].rating).toBe("thumbs-down");
        });
    });

    describe("getFeedbackSummary", () => {
        it("should return correct summary for empty feedback", () => {
            const summary = server.getFeedbackSummary();

            expect(summary.total).toBe(0);
            expect(summary.byRating["thumbs-up"]).toBe(0);
            expect(summary.byRating["thumbs-down"]).toBe(0);
            expect(summary.byRating["issue-report"]).toBe(0);
            expect(summary.byTool).toEqual({});
        });

        it("should return correct summary with feedback data", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "model",
            });
            server.processFeedback({
                rating: "thumbs-down",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "issue-report",
                toolName: "debug",
            });

            const summary = server.getFeedbackSummary();

            expect(summary.total).toBe(4);
            expect(summary.byRating["thumbs-up"]).toBe(2);
            expect(summary.byRating["thumbs-down"]).toBe(1);
            expect(summary.byRating["issue-report"]).toBe(1);
            expect(summary.byTool["trace"]).toBe(2);
            expect(summary.byTool["model"]).toBe(1);
            expect(summary.byTool["debug"]).toBe(1);
        });

        it("should count multiple entries for same tool", () => {
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });
            server.processFeedback({
                rating: "thumbs-down",
                toolName: "trace",
            });

            const summary = server.getFeedbackSummary();

            expect(summary.total).toBe(3);
            expect(summary.byTool["trace"]).toBe(3);
            expect(summary.byRating["thumbs-up"]).toBe(2);
            expect(summary.byRating["thumbs-down"]).toBe(1);
        });
    });

    describe("getStoragePath", () => {
        it("should return the correct storage path", () => {
            const storagePath = server.getStoragePath();

            expect(storagePath).toBe(path.join(tempDir, "feedback.json"));
        });
    });

    describe("edge cases", () => {
        it("should handle empty string comment", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                comment: "",
            });

            expect(result.status).toBe("success");
            expect(result.hasComment).toBe(false);
        });

        it("should handle very long comments", () => {
            const longComment = "A".repeat(10000);
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                comment: longComment,
            });

            expect(result.status).toBe("success");
            expect(result.hasComment).toBe(true);

            const feedback = server.getAllFeedback();
            expect(feedback[0].comment).toBe(longComment);
        });

        it("should handle special characters in comment", () => {
            const specialComment = "Great tool! 🎉 <script>alert('xss')</script> \"quotes\" 'apostrophes'";
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
                comment: specialComment,
            });

            expect(result.status).toBe("success");

            const feedback = server.getAllFeedback();
            expect(feedback[0].comment).toBe(specialComment);
        });

        it("should handle special characters in toolName", () => {
            const specialToolName = "my-custom-tool_v2.0";
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: specialToolName,
            });

            expect(result.status).toBe("success");
            expect(result.toolName).toBe(specialToolName);
        });

        it("should generate valid ISO timestamp", () => {
            const result = server.processFeedback({
                rating: "thumbs-up",
                toolName: "trace",
            });

            expect(result.status).toBe("success");
            const timestamp = new Date(result.timestamp);
            expect(timestamp.toISOString()).toBe(result.timestamp);
        });

        it("should handle concurrent feedback submissions", () => {
            // Submit multiple feedback entries rapidly
            const promises = Array.from({ length: 10 }, (_, i) =>
                server.processFeedback({
                    rating: i % 2 === 0 ? "thumbs-up" : "thumbs-down",
                    toolName: `tool-${i}`,
                })
            );

            // All should succeed
            promises.forEach((result) => {
                expect(result.status).toBe("success");
            });

            const allFeedback = server.getAllFeedback();
            expect(allFeedback).toHaveLength(10);
        });
    });

    describe("failed feedback response structure", () => {
        it("should have correct structure for failed responses", () => {
            const result = server.processFeedback({
                rating: "invalid",
                toolName: "trace",
            });

            expect(result.status).toBe("failed");
            expect(result.id).toBe("");
            expect(result.toolName).toBe("");
            expect(result.invocationId).toBe("");
            expect(result.message).toBe("Failed to process feedback");
            expect(result.hasComment).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
    });
});
